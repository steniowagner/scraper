const nodemailer = require('nodemailer');

const sendEmail = () =>
  nodemailer.createTestAccount(err => {
    if (err) {
      console.log(err);
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.googlemail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'rabodecalango02',
        pass: 'vaidarcerto123',
      },
    });

    const mailOptions = {
      from: '"BOT - Zoneamento" <rabodecalango02@gmail.com>',
      to: ['eduardo@hypercodetech.com.br', 'stenio.wagner1@gmail.com'],
      subject: 'Algoritmo Finalizado',
      text: 'Tá na hora de olhar o banco...',
    };

    transporter.sendMail(mailOptions, error => {
      if (error) {
        return console.log(error);
      }
    });
  });

module.exports = sendEmail;
