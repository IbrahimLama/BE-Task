const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');

const contractRouters = require('./routes/contract.routers');
const jobRouters = require('./routes/job.routers');
const profileRouters = require('./routes/profile.routers');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.use('/contracts', contractRouters);
app.use('/jobs', jobRouters);
app.use('/', profileRouters);

module.exports = app;
