const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getProfile = async (req, res) => {
  // req.user viene del middleware de auth
  const user = req.user;
  res.json({ id: user.id, email: user.email, name: user.name, phone: user.phone, avatar_url: user.avatar_url });
};

exports.updateProfile = async (req, res) => {
  const allowed = ['name','phone','avatar_url'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  await User.update(updates, { where: { id: req.user.id }});
  const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password_hash'] }});
  res.json(updated);
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'currentPassword y newPassword requeridos' });
  const user = await User.findByPk(req.user.id);
  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Contraseña actual incorrecta' });
  const password_hash = await bcrypt.hash(newPassword, 12);
  await User.update({ password_hash }, { where: { id: user.id }});
  res.json({ message: 'Contraseña actualizada' });
};
