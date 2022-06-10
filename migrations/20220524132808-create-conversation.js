module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversations', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      senderId: {
        type: Sequelize.UUID,
      },
      recieverId: {
        type: Sequelize.UUID,
      },
      state: {
        type: Sequelize.ENUM(
          'unfriend',
          'accepted',
          'pending',
          'blocked',
          'rejected'
        ),
        defaultValue: 'pending',
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
    await queryInterface.dropTable('conversations');
  },
};
