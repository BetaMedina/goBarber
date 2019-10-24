import NotificationSchema from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true }
    });
    if (!isProvider) {
      return res
        .status(400)
        .json({ erro: 'Only providers can load notficiations' });
    }
    const notifications = await NotificationSchema.find({
      user: req.userId
    })
      .sort({ createdAt: 'desc' })
      .limit(20);
    return res.json({ notifications });
  }

  async update(req, res) {
    // const notification = NotificationSchema.findById(req.params.id);

    const notification = await NotificationSchema.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    return res.json({ notification });
  }
}

export default new NotificationController();
