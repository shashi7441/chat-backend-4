'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class conversation extends Model {
    static associate(models) {
      conversation.belongsTo(models.users, {
        as: 'sender',
        foreignKey: 'senderId',
      });
      conversation.belongsTo(models.users, {
        as: 'reciever',
        foreignKey: 'recieverId',
      });
    }
  }
  conversation.init(
    {
      senderId: DataTypes.UUID,
      recieverId: DataTypes.UUID,
      state: DataTypes.ENUM(
        'unfriend',
        'accepted',
        'pending',
        'blocked',
        'rejected'
      ),
    },
    {
      sequelize,
      modelName: 'conversation',
    }
  );
  return conversation;
};
