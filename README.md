# User Registration and Login API

A Node.js Express API with JWT authentication, file upload, and MongoDB integration.

## Security Features

- **Password Hashing**: Uses bcryptjs with salt rounds for secure password storage
- **Password Protection**: Password field excluded from database queries by default (`select: false`)
- **Email Validation**: Server-side email format validation with regex
- **Input Validation**: Comprehensive validation for all user inputs
- **JWT Security**: Tokens expire after 1 hour and include only user ID
- **Error Handling**: Detailed error messages without exposing sensitive information

## Setup

1. Make sure MongoDB is running on your system (or use MongoDB Atlas)
2. Install dependencies: `npm install`
3. Start the server: `npm start`

## API Endpoints

### 1. User Registration
**POST** `http://localhost:3000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- **Username**: 3-50 characters, letters, numbers, spaces, hyphens, and underscores only
- **Email**: Valid email format (e.g., user@domain.com)
- **Password**: Minimum 6 characters, hashed with bcrypt (12 salt rounds)

**Expected Response (Success):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### 2. User Login (JWT)
**POST** `http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response (Error - Invalid credentials):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 3. Upload Image
**POST** `http://localhost:3000/api/auth/upload`

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (Form Data):** Select `image` field and choose an image file

**Expected Response (Success):**
```json
{
  "message": "Image uploaded successfully",
  "filename": "1640995200000-image.jpg",
  "originalname": "image.jpg",
  "size": 1024000,
  "url": "/uploads/1640995200000-image.jpg"
}
```

---

#### Get User Profile (Protected)
**GET** `http://localhost:3000/api/auth/profile`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "id": "user_id",
  "username": "johndoe",
  "email": "john@example.com",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

## JWT Token Usage

After successful login, include the JWT token in the Authorization header for protected routes:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Postman Setup Guide

1. **Open Postman** and create a new request
2. **Set the request method** (POST for registration/login/upload, GET for users/health/profile)
3. **Enter the URL** (e.g., `http://localhost:3000/api/auth/register` or `http://localhost:3000/health` or `http://localhost:3000/api/auth/profile`)
4. **Add headers:**
   - For JSON requests: `Content-Type: application/json`
   - For file uploads: `Content-Type: multipart/form-data`
   - For protected routes: `Authorization: Bearer YOUR_JWT_TOKEN`
5. **For POST requests, add body:**
   - For JSON: Select "raw" and "JSON", enter the JSON data
   - For file upload: Select form-data, add `image` field, and select a file
6. **Click Send** to test the endpoint

## Troubleshooting

### "Invalid credentials" Error
- **Check if user exists**: Visit `http://localhost:3000/api/users`
- **Register first**: You must register a user before you can login
- **Check credentials**: Make sure email/password match what you registered

### "Internal server error" Error
- **Check MongoDB connection**: Visit `http://localhost:3000/health`
- **Start MongoDB**: Run `mongod` in a separate terminal
- **Check server logs**: Look for detailed error messages in console

### MongoDB Connection Issues
- **Local MongoDB**: Install MongoDB and run `mongod`
- **Cloud MongoDB**: Use MongoDB Atlas and update `MONGODB_URI` in `.env`
- **Check connection**: Health endpoint will show "Connected" or "Not Connected"

### Common Issues
- **Port already in use**: Change PORT in `.env` file
- **MongoDB not running**: Start MongoDB service first
- **Wrong credentials**: Use same email/password as registration

## Important Notes

- **MongoDB**: Must be installed and running locally, or use MongoDB Atlas
- **Password Security**: Passwords are hashed using bcryptjs with salt rounds - never stored in plain text
- **JWT Tokens**: Expire after 1 hour for security and include only user ID (not email/password)
- **File Uploads**: Only image files are allowed, maximum 5MB with validation
- **Input Validation**: All inputs are validated on server-side with detailed error messages
- **Security**: Password field is excluded from queries by default for additional security
- **Email Format**: Server validates email format using regex patterns

## Environment Variables

Create a `.env` file with:

```env
MONGODB_URI=mongodb://localhost:27017/user-auth
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```
