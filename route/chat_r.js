import express from 'express';
import {
  sendMessage,
  getChatHistory,
  getConversations,
  markAsRead,
} from '../controller/chat_c.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Send message
router.post('/send', sendMessage);

// Get chat history with specific user
router.get('/:userId', getChatHistory);

// Get all conversations
router.get('/', getConversations);

// Mark messages as read
router.put('/:userId/mark-read', markAsRead);

export default router;
