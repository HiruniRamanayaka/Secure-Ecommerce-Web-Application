const router = require('express').Router();
const { jwtCheck } = require('../config/auth');
const { attachUser, requireUser } = require('../middleware/authMiddleware');
const { profile, validateToken } = require('../controllers/authConroller');

router.get('/profile', jwtCheck, attachUser, requireUser, profile);
router.get('/validate', jwtCheck, attachUser, requireUser, validateToken);

module.exports = router;
