import Sequelize, {Model} from 'sequelize';

import { isBefore } from 'date-fns';

class Delivery extends Model {
  static init(sequelize){
    super.init(
      {
        status: {
          type: Sequelize.VIRTUAL,
          get() {
            if (this.canceled_at) {
              return 'cancelado';
            } else {
              if (this.start_date) {
                if (this.canceled_at) return 'cancelado';
                if (this.end_date) return 'entregue';
                return 'retirada';
              }
              return 'pendente';
            }
          },
        },
        recipient_id: Sequelize.INTEGER,
        deliveryman_id: Sequelize.INTEGER,
        signature_id: Sequelize.INTEGER,
        product: Sequelize.STRING,
        canceled_at: Sequelize.DATE,
        deleted_at: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          }
        },
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
      },
      {
        sequelize,
        paranoid: true,
      }
    );

    return this;
  }

  static associate(models){
    this.belongsTo(models.Recipient, { foreignKey: 'recipient_id', as: 'recipient'});
    this.belongsTo(models.Deliveryman, { foreignKey: 'deliveryman_id', as: 'deliveryman'});
    this.belongsTo(models.File, { foreignKey: 'signature_id', as: 'signature', });
  }

}

export default Delivery;
