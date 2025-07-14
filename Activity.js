const { DataTypes } = require('sequelize');
const sequelize = require('./Database');

const Activity = sequelize.define('Activity', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  walking: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  running: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  walkingDistance: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  runningDistance: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  timestamps: false
});

// Create the table if it doesn't exist
Activity.sync();

module.exports = Activity;