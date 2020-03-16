import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init({
      name: Sequelize.STRING,
      address: Sequelize.STRING,
      number: Sequelize.INTEGER,
      additional: Sequelize.STRING,
      state: Sequelize.STRING,
      city: Sequelize.STRING,
      zip_code: Sequelize.INTEGER,
      deleted_at: Sequelize.DATE,
    },
    {
      sequelize,
      paranoid: true,
    });
    return this;
  }
}

export default Recipient;
