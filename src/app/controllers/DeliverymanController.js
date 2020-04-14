import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import { Op } from 'sequelize';

import User from '../models/User';
import File from '../models/File';

class DeliverymanController {
  async index(req, res){
    const name = req.query.q;

    var deliverymans = null;

    if(name != null){
      deliverymans = await Deliveryman.findAll({
      where: {name: {[Op.iLike]: '%'+name+'%'}},
      attributes: ['id', 'name', 'avatar_id', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    } else{
      deliverymans = await Deliveryman.findAll({
        attributes: ['id', 'name', 'avatar_id', 'email'],
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });
    }

    const userIsAdmin = await User.findOne({ where: { id: req.userId, admin: true } });

    if(!userIsAdmin) {
      return res.status(401).json({ error: 'Only admins can list deliverymans' });
    }

    return res.json(deliverymans);
  }

  async indexOne(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!deliveryman) {
      return res.status(400).json({
        message: 'Deliveryman not found!',
      });
    }

    return res.json(deliveryman);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required('O nome é obrigatório'),
      email: Yup.string().email().required('O email é obrigatório'),
      avatar_id: Yup.number('Deve ser um número').required('O avatar é obrigatório'),
    });

    if(!(await schema.isValid(req.body))){
      return res.status(400).json({ error: 'Validation fails ' });
    }

    const userIsAdmin = await User.findOne({ where: { id: req.userId, admin: true } });

    if(!userIsAdmin) {
      return res.status(401).json({ error: 'Only admins can create new deliverymans' });
    }

    const {
      id,
      name,
      avatar_id,
      email} = await Deliveryman.create(req.body);

    return res.json({
      id,
      name,
      avatar_id,
      email});
  }

  async update(req, res){
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    const userIsAdmin = await User.findOne({ where: { id: req.userId, admin: true } });

    if(!userIsAdmin) {
      return res.status(401).json({ error: 'Only admins can list deliverymans' });
    }

    const { id, name, email,} = await deliveryman.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async delete(req, res){
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    const userIsAdmin = await User.findOne({ where: { id: req.userId, admin: true } });

    if(!userIsAdmin) {
      return res.status(401).json({ error: 'Only admins can delete deliverymans' });
    }

    const { id, name, email} = await deliveryman.destroy({
      where:
      {
        id: req.params.id
      }
    });

    return res.json({
      id,
      name,
      email,
      "msg": "Deliveryman deleted"
    });
  }
}

export default new DeliverymanController();
