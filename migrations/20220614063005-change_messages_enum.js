'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn('messages', "status",
    {
     type: Sequelize.ENUM("read", "unread", "edit", "unedited"),
     defaultValue: 'unedited',
 })
    
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('messages', "state")

// return queryInterface.changeColumn('messages', "state",
// {
//  type: Sequelize.ENUM("read, unread, edit, unedited"),
//  defaultValue: 'unedited',
// })
  }
};