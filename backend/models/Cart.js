import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'guest',
    index: true,
  },
  platform: {
    type: String,
    required: true,
    trim: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    default: 0,
  },
  discountPct: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  delivery: {
    type: String,
    default: 'Standard',
  },
  trustScore: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: 'In Stock',
  },
  buyUrl: {
    type: String,
    default: '#',
  },
  platformColor: {
    type: String,
    default: '#00f0ff',
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

export default CartItem;
