'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      to: {
        type: Sequelize.UUID,
      },
      from: {
        type: Sequelize.UUID,
      },
      message: {
        type: Sequelize.STRING,
      },
      state: {
        type: Sequelize.ENUM('unedited', 'edited', "read", "unread" ),
        defaultValue: 'unedited',
      },
      conversationId: {
        type: Sequelize.UUID,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
  },
};
