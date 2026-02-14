import express from 'express';
import { 
  loginUser, 
  registerUser, 
  getMe, 
  verifyAndChangeEmail,
  changePassword,
  resetPassword
} from '../controller/auth_c.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/change-email', protect, verifyAndChangeEmail);
router.post('/change-password', protect, changePassword);

export default router;
