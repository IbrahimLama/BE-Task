const { Op } = require('sequelize');
const { sequelize } = require('../model');

/**
 * @returns Deposits money into the balance of a client
 */
const depositeBalances = async (req, res) => {
  try {
    const { Profile, Contract, Job } = req.app.get('models');
    const { userId } = req.params;
    const { balance } = req.body;

    const contractDetails = await Contract.findOne({
      include: [
        {
          model: Profile,
          as: 'Client',
          where: {
            [Op.and]: [{ id: userId }, { type: 'client' }],
          },
        },
        {
          model: Job,
          where: { paid: true },
          attributes: [[sequelize.fn('sum', sequelize.col('price')), 'price']],
        },
      ],
    });

    if (!contractDetails) {
      return res.json('Client has no contracts');
    }

    const total = parseInt(contractDetails?.Jobs?.[0]?.price);
    const client = contractDetails?.Client;
    const clientBalance = parseInt(client?.balance);
    if (typeof total === 'number' && typeof balance === 'number') {
      if (balance <= (total * 25) / 100) {
        await Profile.update(
          {
            balance: clientBalance + balance,
          },
          {
            where: {
              id: client.id,
            },
          }
        );
        res.status(201).send({ message: 'sucess' });
      } else {
        return res.json('Please deposit a smaller amount');
      }
    } else {
      return res.json('Not valid balance or job price');
    }
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

/**
 * @returns best prefession in a specific period
 */
const getBestProfession = async (req, res) => {
  try {
    const { Profile, Contract, Job } = req.app.get('models');
    const { start, end } = req.query;

    if (!start || !end) {
      return res.json('please send start and end date');
    }
    const parsedStart = Date.parse(start);
    const parsedEnd = Date.parse(end);

    if (!parsedEnd || !parsedStart) {
      return res.json('Not valid date format');
    }

    const results = await Contract.findOne({
      attributes: ['id'],
      include: [
        {
          model: Profile,
          attributes: ['profession'],
          as: 'Contractor',
        },
        {
          model: Job,
          attributes: [
            [sequelize.fn('max', sequelize.col('price')), 'maxPrice'],
          ],
          where: {
            paid: true,
            paymentDate: {
              [Op.between]: [parsedStart, parsedEnd],
            },
          },
        },
      ],
    });
    if (!results) return res.json('No paid profession found');
    const profession = results?.Contractor?.profession;
    return res.status(200).json({ profession });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

/**
 * @returns best client in a specific period
 */
const getBestClients = async (req, res) => {
  try {
    const { Job, Contract, Profile } = req.app.get('models');
    const { start, end, limit = 2 } = req.query;

    if (!start || !end) {
      return res.json('please send start and end date');
    }
    const parsedStart = Date.parse(start);
    const parsedEnd = Date.parse(end);

    if (!parsedEnd || !parsedStart) {
      return res.json('Not valid date format');
    }

    const results = await Contract.findAll({
      limit,
      attributes: [],
      //sequelize.fn('sum', sequelize.col('price')
      order: [[Job, 'price', 'DESC']],
      include: [
        {
          model: Profile,
          attributes: ['firstName', 'lastName'],
          as: 'Client',
        },
        {
          model: Job,
          attributes: ['price'],
          where: {
            paid: true,
            paymentDate: {
              [Op.between]: [parsedStart, parsedEnd],
            },
          },
        },
      ],
    });
    res.json({ results });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

module.exports = {
  depositeBalances,
  getBestProfession,
  getBestClients,
};
