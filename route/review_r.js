import express from 'express';
import {
  addReview,
  getSellerReviews,
  getSellerRating,
  getMyReviews,
  updateReview,
  deleteReview,
} from '../controller/review_c.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Add a review (protected)
router.post('/', protect, addReview);

// Get reviews for a seller (public)
router.get('/seller/:sellerId', getSellerReviews);

// Get average rating for a seller (public)
router.get('/seller/:sellerId/rating', getSellerRating);

// Get my reviews (protected)
router.get('/my-reviews', protect, getMyReviews);

// Update a review (protected)
router.put('/:reviewId', protect, updateReview);

// Delete a review (protected)
router.delete('/:reviewId', protect, deleteReview);

export default router;
