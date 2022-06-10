'use strict';
import { Model } from 'sequelize';
module.exports = (sequelize, DataTypes) => {
  class messages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      messages.belongsTo(models.users, {
        as: 'sender',
        foreignKey: 'from',
      });
      messages.belongsTo(models.users, {
        as: 'reciever',
        foreignKey: 'to',
      });
    }
  }
  messages.init(
    {
      conversationId: DataTypes.UUID,
      to: DataTypes.UUID,
      from: DataTypes.UUID,
      message: DataTypes.STRING,
      state: DataTypes.ENUM('unedited', 'edited'),
    },
    {
      sequelize,
      modelName: 'messages',
    }
  );
  return messages;
};
