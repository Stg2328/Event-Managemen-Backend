const { Sequelize } = require('sequelize');
require('dotenv').config();  

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: 3306,
  dialect: 'mysql',
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

const connectdb = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { connectdb, sequelize };
