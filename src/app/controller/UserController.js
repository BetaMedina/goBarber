import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        user: Yup.string().required(),
        email: Yup.string()
          .email()
          .required(),
        password: Yup.string()
          .required()
          .min(6)
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).send({ data: 'validation failed' });
      }

      const user = await User.create(req.body);

      return res.status(200).send(user);
    } catch (e) {
      return res.status(400).send({ data: 'Usuario já existe' });
    }
  }

  async read(req, res) {
    try {
      const user = await User.findAll({});
      return res.status(200).send(user);
    } catch (e) {
      return res.status(400).send(e);
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      user: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        )
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).send({ data: 'validation failed' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);
    if (email !== user.email) {
      return res.status(401).json({ err: 'wrong email' });
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ err: 'Password does not match' });
    }

    try {
      const updated = await user.update(req.body);
      console.log(req.body);
      const { name, provider } = updated;
      return res.json({ data: 'Success', email, name, provider });
    } catch (err) {
      return res.status(400).json({ err: 'operation not success' });
    }
  }
}
export default new UserController();
