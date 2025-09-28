// models/PasswordReset.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const PasswordReset = sequelize.define('PasswordReset', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4,  // Genera UUID automáticamente
    primaryKey: true 
  },
  userId: { type: DataTypes.UUID, allowNull: false },
  token_hash: { type: DataTypes.STRING, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'PasswordResets',
  createdAt: 'createdAt',
  updatedAt: false,
});

module.exports = PasswordReset;