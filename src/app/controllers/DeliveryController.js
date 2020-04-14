import * as Yup from 'yup';
import { getHours, parseISO } from 'date-fns';
import Delivery from '../models/Delivery';
import { Op } from 'sequelize';

import Recipient from '../models/Recipient';
import User from '../models/User';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

import Mail from '../../lib/Mail';

class DeliveryController {
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

  async indexOfDeliveryman(req, res) {
    const deliverymanId = req.params.id;

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: deliverymanId,
        canceled_at: null,
      },
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'address',
            'number',
            'additional',
            'state',
            'city',
            'zip_code',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (req.query.delivered === 'true') {
      const deliveriesDelivered = deliveries.filter(deli => deli.end_date !== null);
      return res.json(deliveriesDelivered);
    }

    if (req.query.delivered === 'false') {
      const deliveriesDelivered = deliveries.filter(deli => deli.end_date === null);
      return res.json(deliveriesDelivered);
    }

    return res.json(deliveries);
  }

  async indexOfDeliverymanOneDelivery(req, res) {
    const { deliverymanId, deliveryId } = req.params;

    const delivery = await Delivery.findByPk(deliveryId, {
      where: {
        deliveryman_id: deliverymanId,
        canceled_at: null,
      },
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'address',
            'number',
            'additional',
            'state',
            'city',
            'zip_code',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(delivery);
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

  async updateSignature(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { deliverymanId, deliveryId } = req.params;
    const { start_date, end_date, signature_id } = req.body;

    const delivery = await Delivery.findByPk(deliveryId);

    if (!delivery) {
      return res.status(400).json({
        message: 'Delivery not found!',
      });
    }

    if (delivery.deliveryman_id !== Number(deliverymanId)) {
      return res.status(400).json({
        message: 'Deliveryman do not have permission to access this delivery',
      });
    }

    if (start_date && end_date) {
      return res.status(400).json({
        message: 'You cannot perform two operations at the same time',
      });
    }

    if (!start_date && !end_date) {
      return res.status(400).json({
        message: 'No operations detected',
      });
    }

    if (start_date) {
      const hours = getHours(parseISO(start_date));

      if (hours < 8 || hours > 18) {
        return res.status(400).json({
          message: 'Out of delivery hours',
        });
      }

      const deliveriesDelivered = await Delivery.findAll({
        where: {
          deliveryman_id: deliverymanId,
          end_date: {
            [Op.ne]: null,
          },
        },
      });

      if (deliveriesDelivered.length >= 5) {
        return res.status(400).json({
          message: 'You have exceeded the daily limit of 5 deliveries',
        });
      }

      delivery.start_date = start_date;
      await delivery.save();
    }

    if (end_date) {
      if (!signature_id) {
        return res.status(400).json({
          message: 'Signature is required',
        });
      }

      if (!delivery.start_date) {
        return res.status(400).json({
          message: 'The product has not yet been collected for delivery',
        });
      }

      delivery.end_date = end_date;
      delivery.signature_id = Number(signature_id);
      await delivery.save();
    }

    return res.json(delivery);
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

export default new DeliveryController();
