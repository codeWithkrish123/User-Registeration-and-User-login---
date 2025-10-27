import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/user-auth';

// Multer configuration for file uploads
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be saved in 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB (but don't exit if it fails - just log the error)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    console.log('🚀 Server is ready to handle requests');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('💡 Continuing without database connection...');
    console.log('📝 Note: You need to install and start MongoDB to persist data');
  });

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected',
    timestamp: new Date().toISOString()
  });
});
// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    let { username, email, password } = req.body;

    // Sanitize inputs
    username = username?.trim();
    email = email?.trim().toLowerCase();

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ message: 'Username must be between 3 and 50 characters long' });
    }

    // Validate username contains only allowed characters (alphanumeric, spaces, hyphens, underscores)
    const usernameRegex = /^[a-zA-Z0-9\s\-_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: 'Username can only contain letters, numbers, spaces, hyphens, and underscores' });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection not available. Please start MongoDB.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ message: 'Email already exists' });
      }
    }

    // Hash password with salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed successfully for new user');

    // Create new user
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword
    });

    await newUser.save();
    console.log('✅ New user created successfully:', email);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        message: `${field === 'username' ? 'Username' : 'Email'} already exists`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

// Authentication for security by JWT

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection not available. Please start MongoDB.' });
    }

    // Find user (explicitly include password for authentication)
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('User email:', email);
    console.log('User has password:', user && user.password ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials - User not found' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'Invalid credentials - No password stored' });
    }

    // Check password (Note: In production, use bcrypt for password hashing)
    let isValidPassword = false;
    try {
      console.log('Comparing passwords...');
      console.log('User password hash length:', user.password ? user.password.length : 0);
      console.log('User password starts with:', user.password ? user.password.substring(0, 10) : 'N/A');

      isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', isValidPassword);
    } catch (bcryptError) {
      console.error('Bcrypt comparison error:', bcryptError);
      console.log('Attempting fallback password check...');

      // Fallback: Check if password is stored in plain text (development only)
      if (user.password === password) {
        console.log('⚠️ WARNING: Password was stored in plain text! This should not happen in production.');
        isValidPassword = true;
      } else {
        return res.status(500).json({ message: 'Password verification failed' });
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials - Wrong password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users (for testing purposes)
app.get('/api/auth/users', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection not available. Please start MongoDB.' });
    }

    const users = await User.find({}, { password: 0, email: 0 }); // Exclude password and email fields
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Upload Image
app.post('/api/auth/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Return file information
    res.json({
      message: 'Image uploaded successfully',
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (error.message === 'Only image files are allowed!') {
      res.status(400).json({ message: error.message });
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
    } else {
      res.status(500).json({ message: 'File upload failed' });
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get user profile (protected route)
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection not available. Please start MongoDB.' });
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (for testing purposes - REMOVE IN PRODUCTION)
app.delete('/api/auth/user/:email', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection not available. Please start MongoDB.' });
    }

    const { email } = req.params;
    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', deletedUser: { username: deletedUser.username, email: deletedUser.email } });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Registration: http://localhost:${PORT}/api/auth/register`);
  console.log(`🔗 Login (with JWT): http://localhost:${PORT}/api/auth/login`);
  console.log(`🔗 Upload Image: http://localhost:${PORT}/api/auth/upload`);
  console.log(`🔗 Get Users: http://localhost:${PORT}/api/users`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 Profile: http://localhost:${PORT}/api/auth/profile`);
  console.log(`🔗 Delete User: http://localhost:${PORT}/api/auth/user/:email`);
});