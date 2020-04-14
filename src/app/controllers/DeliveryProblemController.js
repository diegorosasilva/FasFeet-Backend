import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import { Op } from 'sequelize';

import Mail from '../../lib/Mail';

class DeliveryProblemController {
  async indexProblems(req, res){
    const deliveryProblems = await DeliveryProblem.findAll({
      attributes: ['id', 'delivery_id', 'description'],
      include: [
        {
          model: Delivery,
          where: { canceled_at: {[Op.is]: null} },
          attributes: ['id'],
        }
      ]
    });

    return res.json(deliveryProblems);
  }

  async indexById(req, res){
    const { id } = req.params;

    const deliveryProblems = await DeliveryProblem.findAll({
      where: { delivery_id: id },
      include: [
        {
          model: Delivery,
          as: 'delivery',
        },
      ],
    });

    return res.json(deliveryProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({
        message: 'Delivery not found!',
      });
    }

    const newDelivery = req.body;
    newDelivery.delivery_id = id;

    const deliveryProblem = await DeliveryProblem.create(newDelivery);

    return res.json(deliveryProblem);
  }

  async cancelById(req, res){
    const { delivery_id } = await DeliveryProblem.findByPk(req.params.id);
    const delivery = await Delivery.findByPk(delivery_id);

    const { id,
      recipient_id,
      deliveryman_id,
      product,
      start_date,
      end_date,
      signature_id,
      canceled_at} = await delivery.update({ canceled_at: new Date()});

    const { name, email } = await Deliveryman.findOne({ where: { id: deliveryman_id } });

    try {
      await Mail.sendMail({
        to: `${name} <${email}>`,
        subject: 'Encomenda CANCELADA',
        text: `${name}, a encomenda de código ${id}, do produto: ${product}, foi cancelada.`,
      });
    } catch (err){
      console.log(err);
    }

    return res.json({
      id,
      recipient_id,
      deliveryman_id,
      product,
      start_date,
      end_date,
      signature_id,
      canceled_at,
      "msg": "Delivery canceled"
    });
  }
}

export default new DeliveryProblemController();
