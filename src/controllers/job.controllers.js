const { Op } = require('sequelize');

/**
 * @returns unpaid jobs for a user, active contracts only
 */
const getUnpaidJobs = async (req, res) => {
  try {
    const { Job, Contract } = req.app.get('models');
    const contracts = await Contract.findAll({
      attributes: ['id'],
      where: {
        [Op.not]: [
          {
            status: 'terminated',
          },
        ],
      },
    });

    if (!contracts) return res.json('No Contracts Found');

    const contractIds = contracts.map((contract) => contract.id);
    const jobs = await Job.findAll({
      where: {
        [Op.and]: [
          {
            paid: {
              [Op.eq]: null,
            },
          },
          {
            ContractId: {
              [Op.in]: contractIds,
            },
          },
        ],
      },
    });
    if (!jobs) return res.json('No Unpaid Jobs Found');
    res.status(200).json({ jobs });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

const payJob = async (req, res) => {
  try {
    const { Job, Contract, Profile } = req.app.get('models');
    const { job_id } = req.params;
    // get job by id
    const job = await Job.findOne({ where: { id: job_id } });

    if (!job) return res.status(404).json('Job id not found').end();

    // get amount to pay
    const { price, ContractId, paid } = job;
    if (paid) {
      return res.json('Job is already paid');
    }
    // get contract by contract id
    const contract = await Contract.findOne({
      where: { id: ContractId },
      include: [
        {
          model: Profile,
          as: 'Client',
        }
      ]
    });

    if (!contract) return res.json('No Contracts Found for this job');

    const { id: contractorId, Client: client } = contract;

    // check client balance
    if (client.balance >= price) {
      //update client balance
      const newPrice = client.balance - price;
      const updateClientBalance = client.update({ balance: newPrice });
      // update contractor balance
      const updateContractorBalance = Profile.update(
        { balance: price },
        {
          where: {
            id: contractorId,
          },
        }
      );
      const updateJob = Job.update(
        { paid: true, paymentDate: Date.now() },
        { where: { id: job_id } }
      );
      try {
        await Promise.all([
          updateClientBalance,
          updateContractorBalance,
          updateJob,
        ]);
      } catch (err) {
        res.status(500).json('Failed To update balance');
      }
    } else {
      return res.json('No enough balance');
    }

    res.status(201).json('Balance Updated');
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

module.exports = {
  getUnpaidJobs,
  payJob,
};
