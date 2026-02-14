import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      enum: ['new', 'used', 'antique'],
      required: true,
    },
    era: {
      type: String,
    },
    listingType: {
      type: String,
      enum: ['fixed', 'auction'],
      required: true,
    },
    price: {
      type: Number,
      required: function () {
        return this.listingType === 'fixed';
      },
    },
    startingBid: {
      type: Number,
      required: function () {
        return this.listingType === 'auction';
      },
    },
    bidIncrement: {
      type: Number,
      default: 1000,
      required: function () {
        return this.listingType === 'auction';
      },
    },
    currentBid: {
      type: Number,
      default: function () {
        return this.startingBid || 0;
      },
    },
    highestBidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    auctionEndDate: {
      type: Date,
    },
    location: {
      type: String,
      required: true,
    },
    images: [
      {
        data: Buffer,
        contentType: String,
        filename: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'sold', 'delisted'],
      default: 'active',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Item', itemSchema);
