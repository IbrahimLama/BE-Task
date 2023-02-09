
const express = require('express');

const jobControllers = require('../controllers/job.controllers');
const { getProfile } = require('../middleware/getProfile');

const router = express.Router();

router.get('/unpaid', getProfile, jobControllers.getUnpaidJobs)

router.post('/:job_id/pay', getProfile, jobControllers.payJob)

module.exports = router;