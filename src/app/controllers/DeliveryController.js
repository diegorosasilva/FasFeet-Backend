import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import { Op } from 'sequelize';

import Recipient from '../models/Recipient';
import User from '../models/User';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

import Mail from '../../lib/Mail';

class DeliverymanController {
  async index(req, res){
    const prod = req.query.q;

    var deliveries = null;

    if(prod != null){
      deliveries = await Delivery.findAll({
      where: {product: {[Op.iLike]: '%'+prod+'%'} },
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at', 'status'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'city', 'state', 'number', 'address', 'zip_code'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        }
      ]
    });
    } else{
      deliveries = await Delivery.findAll({
        attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at', 'status'],
        include: [
          {
            model: Recipient,
            as: 'recipient',
            attributes: ['name', 'city', 'state', 'number', 'address', 'zip_code'],
          },
          {
            model: Deliveryman,
            as: 'deliveryman',
            attributes: ['name'],
            include: [
              {
                model: File,
                as: 'avatar',
                attributes: ['id', 'path', 'url'],
              },
            ],
          }
        ]
      });
    }

    const userIsAdmin = await User.findOne({ where: { id: req.userId, admin: true } });

    if(!userIsAdmin) {
      return res.status(401).json({ error: 'Only admins can list deliverymans' });
    }

    return res.json(deliveries);
  }

  async indexOne(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id, {
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at', 'status'],
        include: [
          {
            model: Recipient,
            as: 'recipient',
            attributes: ['name', 'city', 'state', 'number', 'address', 'zip_code'],
          },
          {
            model: Deliveryman,
            as: 'deliveryman',
            attributes: ['name'],
          }
        ]
    });

    if (!delivery) {
      return res.status(400).json({
        message: 'Deliveryman not found!',
      });
    }

    return res.json(delivery);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({ error: 'Validation fails ' });
    }

    const userIsAdmin = await User.findOne({ where: { id: req.userId, admin: true } });

    if(!userIsAdmin) {
      return res.status(401).json({ error: 'Only admins can create new deliveries' });
    }

    const {
      id,
      recipient_id,
      deliveryman_id,
      product,} = await Delivery.create(req.body);

    const { name, email } = await Deliveryman.findOne({ where: { id: deliveryman_id } });

    try {
      await Mail.sendMail({
        to: `${name} <${email}>`,
        subject: 'Nova encomenda disponível',
        text: `${name}, uma nova encomenda está disponível para retirada, com o produto: ${product}`,
      });
    } catch (err){
      console.log(err);
    }

    return res.json({
      id,
      recipient_id,
      deliveryman_id,
      product,});
  }

  async update(req, res){
    const delivery = await Delivery.findByPk(req.params.id);

    const userIsAdmin = await User.findOne({ where: { id: req.userId, admin: true } });

    if(!userIsAdmin) {
      return res.status(401).json({ error: 'Only admins can update deliveries' });
    }

    const { id,
      recipient_id,
      deliveryman_id,
      product,} = await delivery.update(req.body);

    return res.json({
      id,
      recipient_id,
      deliveryman_id,
      product,
    });
  }

  async delete(req, res){
    const delivery = await Delivery.findByPk(req.params.id);

    const userIsAdmin = await User.findOne({ where: { id: req.userId, admin: true } });

    if(!userIsAdmin) {
      return res.status(401).json({ error: 'Only admins can delete deliveries' });
    }

    /*const { id,
      recipient_id,
      deliveryman_id,
      product} = await delivery.update({ canceled_at: new Date()});
      */

    const { id,
    recipient_id,
    deliveryman_id,
    product} = await delivery.destroy({where: {
      id: req.params.id
    }});


    return res.json({
      id,
      recipient_id,
      deliveryman_id,
      product,
      "msg": "Delivery deleted"
    });
  }

}

export default new DeliverymanController();
