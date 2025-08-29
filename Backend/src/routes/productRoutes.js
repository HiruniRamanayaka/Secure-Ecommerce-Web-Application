const router = require('express').Router();
const { jwtCheck } = require('../config/auth');
const { attachUser, requireUser, requireRole } = require('../middleware/authMiddleware');
const productCtrl = require('../controllers/productController');

// Public listing & product details
router.get('/', productCtrl.list);
router.get('/:id', productCtrl.getOne);

// Admin CRUD
router.post('/', jwtCheck, attachUser, requireUser, requireRole('admin'), productCtrl.create);
router.put('/:id', jwtCheck, attachUser, requireUser, requireRole('admin'), productCtrl.update);
router.delete('/:id', jwtCheck, attachUser, requireUser, requireRole('admin'), productCtrl.remove);

module.exports = router;
