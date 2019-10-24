import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controller/UserController';
import SessionController from './app/controller/SessionController';
import authMiddleware from './app/middleware/auth';
import FileController from './app/controller/FileController';
import ProviderController from './app/controller/ProviderController';
import AppointmentController from './app/controller/AppointmentController';
import ScheduleController from './app/controller/ScheduleController';
import NotificationController from './app/controller/NotificationController';
import AvaliableController from './app/controller/AvaliableController';

const upload = multer(multerConfig);

const routes = new Router();
routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);

routes.use(authMiddleware);
routes.get('/users', UserController.read);
routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);

routes.post('/appointments', AppointmentController.store);
routes.get('/appointments', AppointmentController.index);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get('/providers/:id/avaliable', AvaliableController.index);

routes.get('/schedule', ScheduleController.index);
routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.post(
  '/files',
  upload.single('file'),

  FileController.store
);

export default routes;
