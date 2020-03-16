'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('recipients', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        number: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        additional: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: false,
        },
        state: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        city: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: false,
        },
        zip_code: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        created_at :{
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        deleted_at :{
          type: Sequelize.DATE,
          allowNull: false,
        }
      }
    );
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('recipients');
  }
};
