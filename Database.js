const { Sequelize } = require('sequelize');
const path = require('path');
const { app } = require('electron');

// Initialize SQLite database in user's application data folder
const dbPath = path.join(app.getPath('userData'), 'workout-tracker.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false // Set to true if you want to see SQL queries in console
});

// Test the connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

module.exports = sequelize;