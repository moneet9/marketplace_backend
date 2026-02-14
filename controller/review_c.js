import Review from '../model/Review.js';
import Item from '../model/Item.js';
import User from '../model/User.js';

// @desc    Add a review for a seller
// @route   POST /api/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { itemId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    // Validate input
    if (!itemId || !rating || !comment) {
      return res.status(400).json({ message: 'Item ID, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if item exists
    const item = await Item.findById(itemId).populate('sellerId');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const sellerId = item.sellerId._id;

    // Check if user is trying to review their own listing
    if (sellerId.toString() === reviewerId) {
      return res.status(400).json({ message: 'You cannot review your own listing' });
    }

    // Check if review already exists for this item by this reviewer
    const existingReview = await Review.findOne({ reviewerId, itemId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this seller for this item' });
    }

    // Create review
    const review = await Review.create({
      sellerId,
      reviewerId,
      itemId,
      rating,
      comment,
    });

    // Populate reviewer details
    const populatedReview = await Review.findById(review._id).populate('reviewerId', 'name email');

    res.status(201).json({
      message: 'Review added successfully',
      review: populatedReview,
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews for a seller
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
export const getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Check if seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Get all reviews for this seller
    const reviews = await Review.find({ sellerId })
      .populate('reviewerId', 'name avatar')
      .populate('itemId', 'title')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    res.json({
      reviews,
      totalReviews,
      averageRating: averageRating.toFixed(1),
    });
  } catch (error) {
    console.error('Error fetching seller reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get average rating for a seller
// @route   GET /api/reviews/seller/:sellerId/rating
// @access  Public
export const getSellerRating = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Get all reviews for this seller
    const reviews = await Review.find({ sellerId });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    res.json({
      totalReviews,
      averageRating: averageRating.toFixed(1),
    });
  } catch (error) {
    console.error('Error fetching seller rating:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews by a specific reviewer
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = async (req, res) => {
  try {
    const reviewerId = req.user.id;

    const reviews = await Review.find({ reviewerId })
      .populate('sellerId', 'name email')
      .populate('itemId', 'title images')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.user.id;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.reviewerId.toString() !== reviewerId) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    // Update fields
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }
    if (comment) {
      review.comment = comment;
    }

    await review.save();

    const updatedReview = await Review.findById(reviewId).populate('reviewerId', 'name email');

    res.json({
      message: 'Review updated successfully',
      review: updatedReview,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const reviewerId = req.user.id;

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.reviewerId.toString() !== reviewerId) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
