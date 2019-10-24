import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import AuthConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    /** Inicio da validação */

    const schema = Yup.object().shape({
      email: Yup.string().email(),
      password: Yup.string().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).send({ data: 'validation failed' });
    }
    /** Fim da validação */

    const { email, password } = req.body;
    const userDb = await User.findOne({ where: { email } });

    if (!userDb) {
      res.status(401).send({ err: 'user not found' });
    }

    if (!(await userDb.checkPassword(password))) {
      res.status(401).send({ err: 'Password does not match' });
    }

    const { id, user } = userDb;
    return res.json({
      user: {
        user,
        email
      },
      token: jwt.sign({ id }, AuthConfig.secret, {
        expiresIn: AuthConfig.expiresIn
      })
    });
  }
}

export default new SessionController();
