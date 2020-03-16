import Delivery from '../models/Delivery';
import sequelize, { Op } from 'sequelize';
import { startOfDay } from 'date-fns';

class MyDeliveryController {
  async indexPending(req, res){
    const deliveries = await Delivery.findAll({
      where: { deliveryman_id: req.params.id, canceled_at: null, end_date: null },
      attributes: ['id', 'recipient_id', 'signature_id', 'product']
    });

    return res.json(deliveries);
  }

  async indexPast(req, res){
    const deliveries = await Delivery.findAll({
      where: { deliveryman_id: req.params.id, end_date: {[Op.ne]: null} },
      attributes: ['id', 'recipient_id', 'signature_id', 'product']
    });

    return res.json(deliveries);
  }

  async updateStart(req, res){
    const delivery = await Delivery.findOne({ where: { id: req.params.deli, deliveryman_id: req.params.id } });

    const qtDel = await Delivery.count({
      where:
      {
        deliveryman_id: req.params.id,
        start_date: {[Op.gte]: startOfDay(new Date())}
      },
      attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'qt_del']] });

    if(qtDel >= 5){
      return res.status(401).json({error: 'You can only start 5 deliveries a day'});
    }

    const { id,
      recipient_id,
      deliveryman_id,
      product,
      start_date} = await delivery.update({ start_date: new Date()});

    return res.json({
      id,
      recipient_id,
      deliveryman_id,
      product,
      start_date,
    });
  }

  async updateEnd(req, res){
    const delivery = await Delivery.findOne({ where: { id: req.params.deli, deliveryman_id: req.params.id } });

    const { id,
      recipient_id,
      deliveryman_id,
      product,
      start_date,
      end_date,
      signature_id} = await delivery.update( { end_date: new Date()});
      //signature_id} = await delivery.update( req.body, { end_date: new Date()});  VERIFICAR POR  QUE NAO FUNCIONA COM BODY

    return res.json({
      id,
      recipient_id,
      deliveryman_id,
      product,
      start_date,
      end_date,
      signature_id
    });
  }

}

export default new MyDeliveryController();
