import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      limit: 20,
      attributes: ['date', 'id'],
      offset: (page - 1) * 20,
      order: ['date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['user', 'provider', 'id'],
          include: {
            model: File,
            as: 'avatar',
            attributes: ['url', 'path']
          }
        }
      ]
    });
    if (appointments) return res.json({ appointments });

    return res.status(400).json({ erro: 'you dont have appointments' });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    });
    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation Fails' });
    const { provider_id, date } = req.body;
    /**
     * Check if Provider_id is provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true }
    });

    if (!isProvider)
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });

    const hourStart = startOfHour(parseISO(date));

    /**
     * check for past dates
     */

    if (isBefore(hourStart, new Date()))
      return res.status(400).json({ erro: 'past dates not permited' });

    /**
     * check date availability
     */

    const availability = await Appointment.findOne({
      where: { provider_id, canceled_at: null, date: hourStart }
    });

    if (availability)
      return res
        .status(400)
        .json({ erro: 'appointment date is not Avaliable' });

    console.log(req.body);

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart
    });
    return res.json(appointment);
  }
}

export default new AppointmentController();
