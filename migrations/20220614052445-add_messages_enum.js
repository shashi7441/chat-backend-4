'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.removeColumn('messages', "state")
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.addColumn('messages', "state",
    {
     type: Sequelize.ENUM("read, unread, edit, unedited"),
     defaultValue: 'unedited',
 })

// return queryInterface.changeColumn('messages', "state",
// {
//  type: Sequelize.ENUM("read, unread, edit, unedited"),
//  defaultValue: 'unedited',
// })
  }
};