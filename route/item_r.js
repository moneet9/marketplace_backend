import express from 'express';
import {
  createItem,
  getAllItems,
  getItemById,
  getMyItems,
  updateItem,
  markAsSold,
  deleteItem,
  placeBid,
  getMyBids,
} from '../controller/item_c.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllItems);

// Protected routes (requires authentication)
router.post('/', protect, createItem);
router.get('/my/items', protect, getMyItems);
router.get('/my/bids', protect, getMyBids);
router.put('/:id/mark-sold', protect, markAsSold);
router.put('/:id/bid', protect, placeBid);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

// Public route - must be after specific routes
router.get('/:id', getItemById);

export default router;
