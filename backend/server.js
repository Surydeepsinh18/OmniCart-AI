/* ==========================================================================
   OmniCart AI — Express.js Backend Server with MongoDB + Persistent Storage
   MongoDB via Mongoose (with fallback disk persistence if local Mongo offline)
   REST API Port: process.env.PORT || 3001
   ========================================================================== */

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import CartItem from './models/Cart.js';
import FaqItem from './models/Faq.js';
import User from './models/User.js';

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/omnicart';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_DB_FILE = path.join(__dirname, 'cart-db.json');
const FALLBACK_FAQ_FILE = path.join(__dirname, 'faq-db.json');
const FALLBACK_CONTACT_FILE = path.join(__dirname, 'contact-db.json');
const FALLBACK_USERS_FILE = path.join(__dirname, 'users-db.json');

app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

let isMongoConnected = false;

// Initialize local JSON storage files if missing
if (!fs.existsSync(FALLBACK_DB_FILE)) {
  fs.writeFileSync(FALLBACK_DB_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(FALLBACK_FAQ_FILE)) {
  fs.writeFileSync(FALLBACK_FAQ_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(FALLBACK_CONTACT_FILE)) {
  fs.writeFileSync(FALLBACK_CONTACT_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(FALLBACK_USERS_FILE)) {
  fs.writeFileSync(FALLBACK_USERS_FILE, JSON.stringify([], null, 2));
}

function readLocalDb() {
  try {
    const data = fs.readFileSync(FALLBACK_DB_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
}

function readUsersDb() {
  try {
    const data = fs.readFileSync(FALLBACK_USERS_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
}

function writeUsersDb(users) {
  try {
    fs.writeFileSync(FALLBACK_USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Failed writing Users DB file:', e.message);
  }
}

function writeLocalDb(items) {
  try {
    fs.writeFileSync(FALLBACK_DB_FILE, JSON.stringify(items, null, 2));
  } catch (e) {
    console.error('Failed writing fallback DB file:', e.message);
  }
}

function readFaqDb() {
  try {
    const data = fs.readFileSync(FALLBACK_FAQ_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
}

function writeFaqDb(items) {
  try {
    fs.writeFileSync(FALLBACK_FAQ_FILE, JSON.stringify(items, null, 2));
  } catch (e) {
    console.error('Failed writing FAQ DB file:', e.message);
  }
}

function readContactDb() {
  try {
    const data = fs.readFileSync(FALLBACK_CONTACT_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
}

function writeContactDb(items) {
  try {
    fs.writeFileSync(FALLBACK_CONTACT_FILE, JSON.stringify(items, null, 2));
  } catch (e) {
    console.error('Failed writing Contact DB file:', e.message);
  }
}

// Connect to MongoDB with timeout
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 2500,
})
.then(() => {
  isMongoConnected = true;
  console.log('✅ MongoDB connected → database: omnicart');
})
.catch((err) => {
  isMongoConnected = false;
  console.warn('⚠️ Local MongoDB service not active. Using persistent local database (cart-db.json).');
  console.warn('   (To use MongoDB Atlas or local Mongo server, start mongod or set MONGO_URI env variable)');
});

// ────────────── REST API Endpoints ──────────────

/**
 * GET /api/cart
 */
app.get('/api/cart', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || 'guest';
    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const items = await CartItem.find({ userId }).sort({ addedAt: -1 });
      return res.json({ success: true, mode: 'mongodb', count: items.length, items });
    } else {
      const allItems = readLocalDb();
      const items = allItems
        .filter(i => (i.userId || 'guest') === userId)
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
      return res.json({ success: true, mode: 'local_persistent', count: items.length, items });
    }
  } catch (err) {
    const userId = req.query.userId || 'guest';
    const items = readLocalDb().filter(i => (i.userId || 'guest') === userId);
    res.json({ success: true, mode: 'fallback', count: items.length, items });
  }
});

/**
 * POST /api/cart
 */
app.post('/api/cart', async (req, res) => {
  try {
    const userId = req.body.userId || req.headers['x-user-id'] || 'guest';
    const payload = {
      userId,
      platform: req.body.platform || 'General',
      productName: req.body.productName || 'Product',
      currentPrice: Number(req.body.currentPrice) || 0,
      originalPrice: Number(req.body.originalPrice) || 0,
      discountPct: Number(req.body.discountPct) || 0,
      rating: Number(req.body.rating) || 4.5,
      delivery: req.body.delivery || 'Standard Delivery',
      trustScore: Number(req.body.trustScore) || 90,
      status: req.body.status || 'In Stock',
      buyUrl: req.body.buyUrl || '#',
      platformColor: req.body.platformColor || '#00f0ff',
      quantity: Number(req.body.quantity) || 1,
      addedAt: new Date(),
    };

    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const item = new CartItem(payload);
      const saved = await item.save();
      return res.status(201).json({ success: true, mode: 'mongodb', item: saved });
    } else {
      const items = readLocalDb();
      const newItem = { _id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), ...payload };
      items.unshift(newItem);
      writeLocalDb(items);
      return res.status(201).json({ success: true, mode: 'local_persistent', item: newItem });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/cart/:id
 */
app.put('/api/cart/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoConnected && mongoose.connection.readyState === 1 && !id.startsWith('cart_')) {
      const updated = await CartItem.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Item not found' });
      return res.json({ success: true, mode: 'mongodb', item: updated });
    } else {
      const items = readLocalDb();
      const idx = items.findIndex(i => i._id === id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Item not found' });
      items[idx] = { ...items[idx], ...req.body };
      writeLocalDb(items);
      return res.json({ success: true, mode: 'local_persistent', item: items[idx] });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/cart/:id
 */
app.delete('/api/cart/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoConnected && mongoose.connection.readyState === 1 && !id.startsWith('cart_')) {
      const deleted = await CartItem.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Item not found' });
      return res.json({ success: true, mode: 'mongodb', message: 'Item removed' });
    } else {
      let items = readLocalDb();
      const initialLength = items.length;
      items = items.filter(i => i._id !== id);
      if (items.length === initialLength) return res.status(404).json({ success: false, error: 'Item not found' });
      writeLocalDb(items);
      return res.json({ success: true, mode: 'local_persistent', message: 'Item removed' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/cart
 */
app.delete('/api/cart', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || 'guest';
    if (isMongoConnected && mongoose.connection.readyState === 1) {
      await CartItem.deleteMany({ userId });
    }
    const items = readLocalDb().filter(i => (i.userId || 'guest') !== userId);
    writeLocalDb(items);
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/faq (Fetch FAQs)
app.get('/api/faq', async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const filter = isAdmin ? {} : { status: 'answered' };
      const faqs = await FaqItem.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, mode: 'mongodb', count: faqs.length, faqs });
    } else {
      let faqs = readFaqDb();
      if (!isAdmin) {
        faqs = faqs.filter(f => f.status === 'answered');
      }
      faqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, mode: 'local_persistent', count: faqs.length, faqs });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/faq/ask (User submits a new question)
app.post('/api/faq/ask', async (req, res) => {
  try {
    const { userName, userQuestion } = req.body;
    if (!userQuestion || !userQuestion.trim()) {
      return res.status(400).json({ success: false, error: 'Question text is required' });
    }

    const payload = {
      userName: userName && userName.trim() ? userName.trim() : 'Anonymous User',
      userQuestion: userQuestion.trim(),
      status: 'pending',
      answer: '',
      createdAt: new Date(),
    };

    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const faq = new FaqItem(payload);
      const saved = await faq.save();
      return res.status(201).json({ success: true, mode: 'mongodb', faq: saved });
    } else {
      const faqs = readFaqDb();
      const newFaq = { _id: 'faq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), ...payload };
      faqs.unshift(newFaq);
      writeFaqDb(faqs);
      return res.status(201).json({ success: true, mode: 'local_persistent', faq: newFaq });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/faq/reply (Admin replies to a question & publishes it)
app.post('/api/faq/reply', async (req, res) => {
  try {
    const { faqId, answer, adminPass } = req.body;
    if (adminPass !== 'admin123') {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Password' });
    }
    if (!faqId || !answer || !answer.trim()) {
      return res.status(400).json({ success: false, error: 'Faq ID and Answer text are required' });
    }

    const updateData = {
      answer: answer.trim(),
      status: 'answered',
      answeredAt: new Date(),
    };

    if (isMongoConnected && mongoose.connection.readyState === 1 && !faqId.startsWith('faq_')) {
      const updated = await FaqItem.findByIdAndUpdate(faqId, updateData, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'FAQ item not found' });
      return res.json({ success: true, mode: 'mongodb', faq: updated });
    } else {
      const faqs = readFaqDb();
      const idx = faqs.findIndex(f => f._id === faqId);
      if (idx === -1) return res.status(404).json({ success: false, error: 'FAQ item not found' });
      faqs[idx] = { ...faqs[idx], ...updateData };
      writeFaqDb(faqs);
      return res.json({ success: true, mode: 'local_persistent', faq: faqs[idx] });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/faq/:id (Admin deletes a question)
app.delete('/api/faq/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const adminPass = req.headers['x-admin-pass'];
    if (adminPass !== 'admin123') {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Password' });
    }

    if (isMongoConnected && mongoose.connection.readyState === 1 && !id.startsWith('faq_')) {
      await FaqItem.findByIdAndDelete(id);
    }
    let faqs = readFaqDb();
    faqs = faqs.filter(f => f._id !== id);
    writeFaqDb(faqs);
    return res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/contact (Save user contact form submission)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, category, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }

    const payload = {
      _id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      email: email.trim(),
      category: category || 'General Support',
      message: message.trim(),
      createdAt: new Date(),
    };

    const msgs = readContactDb();
    msgs.unshift(payload);
    writeContactDb(msgs);
    return res.status(201).json({ success: true, message: 'Message sent successfully!', data: payload });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/contact (Admin view contact messages)
app.get('/api/contact', async (req, res) => {
  try {
    const adminPass = req.headers['x-admin-pass'];
    if (adminPass !== 'admin123') {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const msgs = readContactDb();
    return res.json({ success: true, count: msgs.length, messages: msgs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Invalid email format! Please enter a valid address (e.g. name@domain.com).' });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ success: false, error: 'Weak Password! Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&).' });
    }

    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Account with this email already exists' });
      }
      const user = new User({ name: name.trim(), email: cleanEmail, password });
      const saved = await user.save();
      const token = 'token_' + Date.now() + '_' + saved._id;
      return res.status(201).json({ success: true, user: { _id: saved._id, name: saved.name, email: saved.email }, token });
    } else {
      const users = readUsersDb();
      const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ success: false, error: 'Account with this email already exists' });
      }
      const newUser = {
        _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: name.trim(),
        email: cleanEmail,
        password,
        createdAt: new Date()
      };
      users.push(newUser);
      writeUsersDb(users);
      const token = 'token_' + Date.now() + '_' + newUser._id;
      return res.status(201).json({ success: true, user: { _id: newUser._id, name: newUser.name, email: newUser.email }, token });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Invalid email format! Please enter a valid email address.' });
    }

    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
      const token = 'token_' + Date.now() + '_' + user._id;
      return res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email }, token });
    } else {
      const users = readUsersDb();
      const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
      const token = 'token_' + Date.now() + '_' + user._id;
      return res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email }, token });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback route for static web app
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 OmniCart AI Backend running on port ${PORT}`);
  console.log(`📦 Cart API → http://localhost:${PORT}/api/cart`);
  console.log(`❓ FAQ API → http://localhost:${PORT}/api/faq`);
  console.log(`📬 Contact API → http://localhost:${PORT}/api/contact`);
  console.log(`🔑 Auth API → http://localhost:${PORT}/api/auth/login & /register`);
});
