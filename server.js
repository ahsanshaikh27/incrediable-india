const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.static(path.join(__dirname)));

// Security Headers (production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
    next();
  });
}

// Health check endpoint (required for Docker healthcheck)
app.get('/health', (req, res) => {
  const status = mongoose.connection.readyState === 1 ? 'healthy' : 'degraded';
  res.status(status === 'healthy' ? 200 : 503).json({
    status,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: status
  });
});

// Connect to MongoDB
mongoose.connect('mongodb+srv://ahsan786:Ahsan%40786@cluster0.7affurj.mongodb.net/incredibleindia?appName=Cluster0')
  .then(() => {
    console.log('Connected to MongoDB');
    seedDemoUser();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Seed demo user and admin (upsert to always ensure correct roles)
async function seedDemoUser() {
  try {
    await User.findOneAndUpdate(
      { username: 'user123' },
      { $set: { password: 'user1234', role: 'user' } },
      { upsert: true }
    );
    console.log('Demo user user123 ready.');

    await User.findOneAndUpdate(
      { username: 'admin123' },
      { $set: { password: 'admin1234', role: 'admin' } },
      { upsert: true }
    );
    console.log('Admin user admin123 ready (role: admin).');
  } catch (err) {
    console.error('Error seeding users:', err);
  }
}

// API Routes

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ success: true, user: { id: user._id, username: user.username, role: user.role || 'user' } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Get all bookings with customer details
app.get('/api/admin/bookings', async (req, res) => {
  const { adminId } = req.query;
  try {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const bookings = await Booking.find().sort({ date: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Get stats
app.get('/api/admin/stats', async (req, res) => {
  const { adminId } = req.query;
  try {
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([{ $group: { _id: null, total: { $sum: '$price' } } }]);
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

    // Monthly collection for this year
    const monthly = await Booking.aggregate([
      {
        $group: {
          _id: { month: { $month: '$date' }, year: { $year: '$date' } },
          total: { $sum: '$price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      totalBookings,
      totalRevenue: totalRevenue[0] ? totalRevenue[0].total : 0,
      totalUsers,
      monthly
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a booking
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(400).json({ success: false, message: 'Failed to create booking', error: err.message });
  }
});

// Get user's bookings
app.get('/api/bookings', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }
  try {
    const bookings = await Booking.find({ userId }).sort({ date: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server — 0.0.0.0 allows access from mobile/other devices on same network
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Network access: http://172.22.135.133:${PORT}`);
});
