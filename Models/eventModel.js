const { DataTypes } = require('sequelize');
const { sequelize } = require('../Connection/connection');


const Event = sequelize.define('Event', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING, // Store S3 file URL
  },
});

module.exports = Event;
