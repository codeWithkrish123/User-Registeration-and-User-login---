# How to Fix "Internal server error" in Login

## The Problem
You're getting "Internal server error" instead of "Invalid credentials". This means there's an exception being thrown in the server code.

## Step-by-Step Solution:

### 1. **Check Server Logs**
Start the server and look for detailed error messages:

```bash
npm start
```

Look for these console messages:
- `User found: Yes/No`
- `User has password: Yes/No`
- `Comparing passwords...`
- `User password hash length:`
- `Password comparison result:`

### 2. **Test Health Endpoint**
Check if MongoDB is connected:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "mongodb": "Connected",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

If MongoDB shows "Not Connected", that's your problem!

### 3. **Check if User Exists**
```bash
curl http://localhost:3000/api/users
```

If no users are returned, you need to register first!

### 4. **Register a Test User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 5. **Test Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Most Likely Causes:

### **Cause 1: MongoDB Not Running**
**Solution:**
- Install MongoDB: https://docs.mongodb.com/manual/installation/
- Start MongoDB: `mongod` (in separate terminal)
- Or use MongoDB Atlas (cloud database)

### **Cause 2: No Users in Database**
**Solution:**
1. Register a user first (see step 4 above)
2. Then try to login

### **Cause 3: Wrong Login Credentials**
**Solution:**
- Make sure you're using the same email/password you registered with
- Check server logs for "User not found" message

### **Cause 4: Password Hash Issue**
**Solution:**
- The server now has fallback logic for plain text passwords
- Check logs for bcrypt error messages
- If needed, delete users and re-register

## Quick Test Commands:

```bash
# 1. Check server status
curl http://localhost:3000/health

# 2. Check if users exist
curl http://localhost:3000/api/users

# 3. Register (if no users)
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username":"test","email":"test@example.com","password":"test123"}'

# 4. Login
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'
```

## Expected Flow:
1. ✅ `mongod` running
2. ✅ Server starts: `npm start`
3. ✅ Health check: MongoDB "Connected"
4. ✅ Register user: Success message
5. ✅ Login: JWT token returned
6. ❌ Login with wrong credentials: "Invalid credentials"

## Need More Help?
- Check server console logs after running `npm start`
- Look for specific error messages in the logs
- The detailed logging will show exactly where the process fails
