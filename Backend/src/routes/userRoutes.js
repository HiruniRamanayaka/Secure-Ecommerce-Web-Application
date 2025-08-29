const router = require('express').Router();
const { jwtCheck } = require('../config/auth');
const { attachUser, requireUser, requireRole } = require('../middleware/authMiddleware');
const userCtrl = require('../controllers/userController');

router.get('/me', jwtCheck, attachUser, requireUser, userCtrl.me);                                // View Own Profile
router.get('/', jwtCheck, attachUser, requireUser, requireRole('admin'), userCtrl.list);          // Admin: List All Users

module.exports = router;
