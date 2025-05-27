import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import dotenv from 'dotenv';
import Clinic from './models/Clinic.js';

import authRoutes from './routes/auth.js';
import tokensRoutes from './routes/tokens.js';
import queueRoutes from './routes/queue.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allow subdomains like https://clinic1.leada-client.vercel.app
const allowedOrigins = [/^https:\/\/.*\.leada-client\.onrender\.com$/];

// CORS for Express
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(pattern => pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// Extract subdomain from full hostname (e.g. clinic1.leada-client.vercel.app)
app.use((req, res, next) => {
  const host = req.headers.host;
  if (!host) {
    req.subdomain = null;
    return next();
  }

  const hostname = host.split(':')[0]; // remove port if present
  const parts = hostname.split('.');
  req.subdomain = parts.length >= 4 ? parts[0] : null; // clinic1.leada-client.vercel.app
  next();
});

// Setup Socket.IO with matching CORS
const io = new SocketIO(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.some(pattern => pattern.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Socket.IO CORS error: Origin not allowed'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

app.set('io', io);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('🔌 New client connected');

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected');
  });
});

// GET Clinic Details from Subdomain
app.get('/api/clinic', async (req, res) => {
  const subdomain = req.subdomain;
  if (!subdomain) {
    return res.status(400).json({ error: 'Subdomain not provided' });
  }

  try {
    const clinic = await Clinic.findOne({ domain: subdomain });
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    res.json({
      name: clinic.name,
      domain: clinic.domain,
      plan: clinic.plan,
      last_active_date: clinic.last_active_date,
    });
  } catch (err) {
    console.error('Error fetching clinic:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/clinic/:subdomain', async (req, res) => {
  const subdomain = req.params.subdomain;
  const clinic = await Clinic.findOne({ slug: subdomain });

  if (!clinic) {
    return res.status(404).json({ error: 'Clinic not found' });
  }

  res.json(clinic);
});


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokensRoutes);
app.use('/api/queue', queueRoutes);

// Health Check
app.get('/', (req, res) => {
  if (req.subdomain) {
    res.json({ message: `API running for clinic "${req.subdomain}"` });
  } else {
    res.json({ message: 'API running on main domain' });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
