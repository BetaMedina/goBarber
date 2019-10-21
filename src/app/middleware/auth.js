import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ err: 'token not provided' });
  }

  const [, token] = auth.split(' ');
  try {
    // const user = jwt.console.log(token);
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ err: 'token invalid' });
  }
};
