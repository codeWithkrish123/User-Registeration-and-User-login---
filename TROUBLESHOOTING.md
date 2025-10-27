# Step-by-Step Fix for "Invalid credentials" Error

## Problem: You're getting "Invalid credentials" when trying to login

## Root Causes & Solutions:

### 1. **MongoDB is not running** (Most likely cause)
**Solution A: Install MongoDB locally**
```bash
# Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
# Install and start MongoDB service
```

**Solution B: Use MongoDB Atlas (Cloud)**
1. Go to https://cloud.mongodb.com/
2. Create free account and cluster
3. Get connection string and replace in .env:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/user-auth
```

### 2. **No users registered yet**
**You need to register before you can login!**

**Test Registration:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully"
}
```

### 3. **Wrong login credentials**
**Test Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. **Start the server and check logs**
```bash
# Start server
npm start

# You should see:
# ✅ Connected to MongoDB successfully!
# 🚀 Server is running on port 3000
```

### 5. **Check if users exist**
```bash
# Check users endpoint
curl http://localhost:3000/api/users
```

## Quick Test Commands:

**1. Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**2. Login with the user:**
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**3. Check server logs:**
- Open terminal and run `npm start`
- Look for connection messages and login attempts

## If still getting errors:

1. **Check MongoDB connection:**
   - Make sure MongoDB is installed and running
   - Or use MongoDB Atlas connection string

2. **Check server logs:**
   - Start server with `npm start`
   - Try login and check console output
   - Look for detailed error messages I added

3. **Verify registration worked:**
   - Check `/api/users` endpoint for registered users

## Expected Flow:
1. ✅ Server starts
2. ✅ Register user → Success message
3. ✅ Login with same credentials → JWT token returned
4. ❌ Login with wrong credentials → "Invalid credentials"

## Need Help?
- Check if MongoDB is running: `mongod --version`
- Start MongoDB: `mongod` (in separate terminal)
- Check server logs for detailed error messages
