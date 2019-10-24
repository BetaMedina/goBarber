import { startOfDay, parseISO, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    /**
     * check user is provider
     */
    const user = await User.findOne({
      where: { provider: true, id: req.userId }
    });
    if (!user) res.status(401).json({ erro: 'user is not provider' });

    const { date } = req.query;

    const parseDate = parseISO(date);
    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parseDate), endOfDay(parseDate)]
        }
      },
      order: ['date']
    });

    return res.json({ appointments });
  }
}

export default new ScheduleController();
