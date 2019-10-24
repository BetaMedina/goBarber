import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { appointment } = data;

    await Mail.sendMail({
      to: `${appointment.provider.user}<${appointment.provider.email}>`,
      subject: 'Agendamento Cancelado',
      template: 'layouts/cancellation',
      context: {
        provider: appointment.provider.user,
        user: appointment.user.user,
        date: format(
          parseISO(appointment.date),
          "'dia' dd MMMM', às' H:mm'h'",
          {
            locale: pt
          }
        )
      }
    });
  }
}
export default new CancellationMail();