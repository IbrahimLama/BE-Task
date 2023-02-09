const express = require('express');

const jobControllers = require('../controllers/profile.controllers');
const { getProfile } = require('../middleware/getProfile');

const router = express.Router();

router.post('/balances/deposit/:userId', getProfile, jobControllers.depositeBalances)

router.get('/admin/best-profession', getProfile, jobControllers.getBestProfession)

router.get('/admin/best-clients', getProfile, jobControllers.getBestClients)

module.exports = router;