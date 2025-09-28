const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/passwordReset');
const sendEmail = require('../utils/email');

const SALT_ROUNDS = 12;

exports.register = async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email y password requeridos' });
  try {
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email ya registrado' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, password_hash, name, phone });
    // opcional: enviar email de verificación
    return res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Error interno' }); }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email y password requeridos' });
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Error interno' }); }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email requerido' });
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(200).json({ message: 'Si existe, se envió email' }); // no revelar existencia

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');
    const expires_at = new Date(Date.now() + 60*60*1000); // 1 hora
    await PasswordReset.create({ userId: user.id, token_hash, expires_at });

    const resetLink = `${process.env.BASE_URL}/auth/reset-password?token=${token}&id=${user.id}`;
    await sendEmail(user.email, 'Recuperar contraseña', `Usa este link: ${resetLink}`);

    return res.json({ message: 'Si existe, se envió email' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Error interno' }); }
};

exports.resetPassword = async (req, res) => {
  const { token, id, newPassword } = req.body;
  if (!token || !id || !newPassword) return res.status(400).json({ message: 'token, id y nueva contraseña requeridos' });
  try {
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');
    const record = await PasswordReset.findOne({ where: { userId: id, token_hash } });
    if (!record || record.expires_at < new Date()) return res.status(400).json({ message: 'Token inválido o expirado' });

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await User.update({ password_hash }, { where: { id }});
    await PasswordReset.destroy({ where: { id: record.id }});
    return res.json({ message: 'Contraseña actualizada' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Error interno' }); }
};
