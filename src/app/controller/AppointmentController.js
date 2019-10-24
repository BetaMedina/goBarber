import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      limit: 20,
      attributes: ['date', 'id', 'past', 'cancelable'],
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

    if (isProvider.id === req.userId) {
      return res
        .status(400)
        .json({ error: 'you cant make an appointment with yourself' });
    }

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

    /**
     * Add new Appointment
     */

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart
    });

    /**
     * Notify appointment provider
     */

    const user = await User.findByPk(req.userId);

    const formattedDate = format(hourStart, "'dia' dd MMMM', às' H:mm'h'", {
      locale: pt
    });

    await Notification.create({
      content: `Novo agendamento de ${user.user} para dia ${formattedDate}`,
      user: provider_id
    });
    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['user', 'email']
        },
        {
          model: User,
          as: 'user',
          attributes: ['user', 'email']
        }
      ]
    });
    if (!appointment) {
      return res.status(400).json({
        erro: 'Appointment not found'
      });
    }
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        erro: 'You dont have permission to cancel appointment'
      });
    }
    const dateWithSub = subHours(appointment.date, 2);
    if (isBefore(dateWithSub, new Date())) {
      return res.status(200).json({
        erro: 'You can only cancel appointments 2 hours in advenced'
      });
    }

    await Queue.add(CancellationMail.key, { appointment });

    appointment.canceled_at = new Date();
    await appointment.save();
    return res.json({ appointment });
  }
}

export default new AppointmentController();
