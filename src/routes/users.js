const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const userCtrl = require('../controllers/userController');

router.get('/profile', auth, userCtrl.getProfile);
router.put('/profile', auth, userCtrl.updateProfile);
router.put('/password', auth, userCtrl.changePassword);

module.exports = router;
