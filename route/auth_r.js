import express from 'express';
import { 
  loginUser, 
  registerUser, 
  getMe, 
  verifyOTP, 
  resendOTP, 
  requestEmailChangeOTP,
  verifyAndChangeEmail,
  requestPasswordChangeOTP,
  verifyOTPAndChangePassword,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword
} from '../controller/auth_c.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password-otp', verifyForgotPasswordOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/request-email-change-otp', protect, requestEmailChangeOTP);
router.post('/change-email', protect, verifyAndChangeEmail);
router.post('/request-password-change-otp', protect, requestPasswordChangeOTP);
router.post('/change-password', protect, verifyOTPAndChangePassword);

export default router;
