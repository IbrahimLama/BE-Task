const { Op } = require('sequelize');

/**
* @returns contracts not terminated
*/
const getContracts = async (req, res) => {
  try {
    const { Contract } = req.app.get('models');
    const contract = await Contract.findAll({
      where: {
        [Op.not]: [
          {
            status: 'terminated',
          },
        ],
      },
    });
    if (!contract) {
      return res.json('No Contracts Found');
    }
    res.status(200).json({ contract });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

/**
 * @returns contract by id
 */
const getContractById = async (req, res) => {
  try {
    const { Contract } = req.app.get('models');
    const profileId = req.get('profile_id');
    const { id } = req.params;
    const contract = await Contract.findOne({ where: { id } });
    if (!contract) return res.status(404).end();
    const { ClientId, ContractorId } = contract;
    if (!([ClientId, ContractorId].includes(parseInt(profileId)))) {
      return res
        .status(403)
        .json({ message: "You don't have permission to view this contract" })
        .end();
    }
    res.status(200).json({ contract });
  } catch(err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

module.exports = {
  getContracts,
  getContractById,
};
