const express = require('express');

const profileControllers = require('../controllers/profile.controllers');
const { getProfile } = require('../middleware/getProfile');

const router = express.Router();

router.post('/balances/deposit/:userId', getProfile, profileControllers.depositeBalances)

router.get('/admin/best-profession', getProfile, profileControllers.getBestProfession)

router.get('/admin/best-clients', getProfile, profileControllers.getBestClients)

module.exports = router;