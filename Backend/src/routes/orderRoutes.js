const router = require('express').Router();
const { jwtCheck } = require('../config/auth');
const { attachUser, requireUser, requireRole } = require('../middleware/authMiddleware');
const orderCtrl = require('../controllers/orderController');

// Logged-in user creates order & views own orders
router.post('/', jwtCheck, attachUser, requireUser, orderCtrl.create);           // Place an Order
router.get('/me', jwtCheck, attachUser, requireUser, orderCtrl.myOrders);         // View Own Orders

// Admin views/updates any order
router.get('/', jwtCheck, attachUser, requireUser, requireRole('admin'), orderCtrl.listAll);                        // List All Orders
router.patch('/:id/status', jwtCheck, attachUser, requireUser, requireRole('admin'), orderCtrl.updateStatus);       // Update Order Status    

module.exports = router;
