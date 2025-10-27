import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Test script to check if login issue is with user data or password comparison
async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/user-auth');
    console.log('✅ Connected to MongoDB');

    // Define User schema
    const userSchema = new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      createdAt: Date
    });

    const User = mongoose.model('User', userSchema);

    // Check if any users exist
    const users = await User.find({});
    console.log('📋 Total users in database:', users.length);

    if (users.length === 0) {
      console.log('❌ No users found. You need to register first!');
      console.log('💡 Try: POST /api/auth/register with username, email, password');
    } else {
      console.log('👤 Users found:');
      users.forEach(user => {
        console.log(`   - Email: ${user.email}, Has password: ${!!user.password}`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Make sure MongoDB is running: mongod');
  }
}

testLogin();
