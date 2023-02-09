const express = require('express');

const contractControllers = require('../controllers/contract.controllers');
const { getProfile } = require('../middleware/getProfile');

const router = express.Router();

router.get('/', getProfile, contractControllers.getContracts);

router.get('/:id', getProfile, contractControllers.getContractById);

module.exports = router;
