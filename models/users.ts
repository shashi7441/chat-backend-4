'use strict';

import { Model } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      users.hasMany(models.conversation, {
        as: 'friendRequest',
        foreignKey: 'senderId',
      });
      users.hasMany(models.messages, {
        as: 'sender',
        foreignKey: 'from',
      });
      users.hasMany(models.messages, {
        as: 'reciever',
        foreignKey: 'to',
      });
    }
  }
  users.init(
    {
      otpExpTime: DataTypes.DATE,
      isActive: DataTypes.BOOLEAN,
      email: DataTypes.STRING,
      fullName: DataTypes.STRING,
      otp: DataTypes.INTEGER,
      password: DataTypes.STRING,
      isVerified: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'users',
    }
  );
  return users;
};
