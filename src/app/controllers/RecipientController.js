import * as Yup from 'yup';
import Recipient from '../models/Recipient';
import { Op } from 'sequelize';

import User from '../models/User';

class RecipientController {
  async index(req, res){
    const name = req.query.q;

    var recipients = null;

    if(name != null){
      recipients = await Recipient.findAll({
      where: {name: {[Op.iLike]: '%'+name+'%'}},
      attributes: ['id', 'name', 'address', 'number', 'additional', 'state', 'city', 'zip_code']
    });
    } else{
      recipients = await Recipient.findAll({
        attributes: ['id', 'name', 'address', 'number', 'additional', 'state', 'city', 'zip_code']
      });
    }

    const userIsAdmin = await User.findOne({ where: { id: req.userId, admin: true } });

    if(!userIsAdmin) {
      return res.status(401).json({ error: 'Only admins can list recipients' });
    }

    return res.json(recipients);
  }

  async indexOne(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(400).json({
        message: 'Recipient not found!',
      });
    }

    return res.json(recipient);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      address: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip_code: Yup.number().required(),
    });

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({ error: 'Validation fails ' });
    }

    const userIsAdmin = await User.findOne({ where: { id: req.userId, admin: true } });

    if(!userIsAdmin) {
      return res.status(401).json({ error: 'Only admins can create new recipients' });
    }

    const {
      id,
      name,
      address,
      number,
      additional,
      state,
      city,
      zip_code} = await Recipient.create(req.body);

    return res.json({
      id,
      name,
      address,
      number,
      additional,
      state,
      city,
      zip_code});
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      address: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const recipient = await Recipient.findByPk(id);

    const { name, zip_code, number } = req.body;

    if (
      (name && name !== recipient.name) ||
      (zip_code && zip_code !== recipient.zip_code) ||
      (number && number !== recipient.number)
    ) {
      const recipientExists = await Recipient.findOne({
        where: { name, zip_code, number },
      });

      if (recipientExists) {
        return res.status(400).json({ error: 'Recipient already exists' });
      }
    }

    const { address, additional, state, city } = await recipient.update(
      req.body
    );

    return res.json({
      id,
      name,
      address,
      number,
      additional,
      state,
      city,
      zip_code,
    });
  }

  async delete(req, res){
    const recipient = await Recipient.findByPk(req.params.id);

    const userIsAdmin = await User.findOne({ where: { id: req.userId, admin: true } });

    if(!userIsAdmin) {
      return res.status(401).json({ error: 'Only admins can delete recipients' });
    }

    const { id, name} = await recipient.destroy({
      where:
      {
        id: req.params.id
      }
    });


    return res.json({
      id,
      name,
      "msg": "Delivery deleted"
    });
  }
}

export default new RecipientController();
