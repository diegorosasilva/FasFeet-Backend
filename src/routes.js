import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import MyDeliveryController from './app/controllers/MyDeliveryController';
import FileControler from './app/controllers/FileController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.get('/deliveryman/:id/deliveries', DeliveryController.indexOfDeliveryman);
routes.get('/deliveryman/:deliverymanId/deliveries/:deliveryId', DeliveryController.indexOfDeliverymanOneDelivery);
routes.put('/deliveryman/:deliverymanId/deliveries/:deliveryId', DeliveryController.updateSignature);

routes.get('/recipients', authMiddleware, RecipientController.index);
routes.get('/recipients/:id', authMiddleware, RecipientController.indexOne);
routes.put('/recipients/:id', authMiddleware, RecipientController.update);
routes.post('/recipients', authMiddleware, RecipientController.store);
routes.delete('/recipients/:id', authMiddleware, RecipientController.delete);

routes.get('/deliverymans', DeliverymanController.index);
routes.get('/deliverymans/:id', DeliverymanController.indexOne);

routes.post('/deliverymans', authMiddleware, DeliverymanController.store);
routes.put('/deliverymans/:id', authMiddleware, DeliverymanController.update);
routes.delete('/deliverymans/:id', authMiddleware, DeliverymanController.delete);


routes.get('/deliveries', authMiddleware, DeliveryController.index);
routes.get('/deliveries/:id', authMiddleware, DeliveryController.indexOne);
routes.post('/deliveries', authMiddleware, DeliveryController.store);
routes.put('/deliveries/:id', authMiddleware, DeliveryController.update);
routes.delete('/deliveries/:id', authMiddleware, DeliveryController.delete);

routes.get('/deliverymans/:id/pastdeliveries', MyDeliveryController.indexPast);
routes.get('/deliverymans/:id/pendingdeliveries', MyDeliveryController.indexPending);

//deliveryman manage
routes.put('/deliverymans/:id/getstarted/:deli', MyDeliveryController.updateStart);
routes.put('/deliverymans/:id/delivered/:deli', MyDeliveryController.updateEnd);

// delivery problems
routes.post('/delivery/:id/problems', DeliveryProblemController.store);
routes.get('/deliveryproblems', DeliveryProblemController.indexProblems);
routes.get('/delivery/:id/problems', DeliveryProblemController.indexById);
routes.put('/problem/:id/cancel-delivery', DeliveryProblemController.cancelById);

// upload de imagem
routes.post('/files', upload.single('file'), FileControler.store);

export default routes;
