import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controller/UserController';
import SessionController from './app/controller/SessionController';
import authMiddleware from './app/middleware/auth';
import multerConfig from './config/multer';
import FileController from './app/controller/FileController';

const upload = multer(multerConfig);

const routes = new Router();
routes.post('/session', SessionController.store);
routes.post('/users', UserController.store);
routes.get('/users', UserController.read);
routes.put('/users', authMiddleware, UserController.update);

routes.post(
  '/files',
  upload.single('file'),
  authMiddleware,
  FileController.store
);

export default routes;
