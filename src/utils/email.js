// utils/email.js
const nodemailer = require('nodemailer');

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT || 587);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;

if (!HOST || !PORT || !USER || !PASS) {
  // Log claro en dev; evita incluir PASS
  console.error('[MAILER] Faltan variables SMTP:', {
    host: HOST, port: PORT, user: USER, pass_present: Boolean(PASS),
  });
}

const transporter = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  secure: PORT === 465, // SSL en 465; STARTTLS en 587/2525
  auth: { user: USER, pass: PASS },
});

(async () => {
  try {
    await transporter.verify();
    console.log('[MAILER] Conectado a SMTP:', HOST, PORT);
  } catch (e) {
    console.error('[MAILER] Falló verificación SMTP:', e.message);
  }
})();

module.exports = async function sendEmail(to, subject, text, html) {
  const info = await transporter.sendMail({
    from: '"Reciclaje" <no-reply@reciclaje.app>',
    to,
    subject,
    text,
    html: html || undefined,
  });
  return info;
};
