import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  userName: {
    type: String,
    default: 'Anonymous User',
    trim: true,
  },
  userQuestion: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'answered'],
    default: 'pending',
  },
  answer: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  answeredAt: {
    type: Date,
  },
});

const FaqItem = mongoose.model('FaqItem', faqSchema);
export default FaqItem;
