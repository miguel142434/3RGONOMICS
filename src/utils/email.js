const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

module.exports = async function(to, subject, text) {
  await transporter.sendMail({ from: '"Reciclaje" <no-reply@reciclaje.app>', to, subject, text });
};
