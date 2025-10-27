## 🧪 **Complete Image Upload Testing Guide**

### **Step 1: Start the server**
```bash
npm start
```

### **Step 2: Test upload with a real image**
```bash
# Replace 'path/to/your/image.jpg' with actual image path
curl -X POST http://localhost:3000/api/auth/upload \
  -F "image=@C:\path\to\your\image.jpg"
```

### **Step 3: Test with different scenarios**

**✅ Valid image (should work):**
```bash
curl -X POST http://localhost:3000/api/auth/upload \
  -F "image=@test-image.jpg"
```

**❌ No image provided:**
```bash
curl -X POST http://localhost:3000/api/auth/upload
# Expected: {"message": "No image file provided"}
```

**❌ Non-image file:**
```bash
curl -X POST http://localhost:3000/api/auth/upload \
  -F "image=@document.txt"
# Expected: {"message": "Only image files are allowed!"}
```

**❌ File too large (over 5MB):**
```bash
curl -X POST http://localhost:3000/api/auth/upload \
  -F "image=@large-image.jpg"
# Expected: {"message": "File size too large. Maximum size is 5MB."}
```

### **Step 4: Check uploaded files**
```bash
# List files in uploads directory
dir uploads

# Access uploaded image in browser
# http://localhost:3000/uploads/filename.jpg
```

### **Step 5: Expected Response Formats**

**Success Response:**
```json
{
  "message": "Image uploaded successfully",
  "filename": "1640995200000-image.jpg",
  "originalname": "image.jpg",
  "size": 1024000,
  "url": "/uploads/1640995200000-image.jpg"
}
```

**Error Responses:**
```json
{"message": "No image file provided"}
{"message": "Only image files are allowed!"}
{"message": "File size too large. Maximum size is 5MB."}
{"message": "File upload failed"}
```

### **Step 6: Test with Postman (Alternative)**

1. Open Postman
2. Create new POST request to: `http://localhost:3000/api/auth/upload`
3. Set Body to `form-data`
4. Add key: `image`
5. Select Type: `File`
6. Choose an image file
7. Click Send

### **Step 7: Verify Static File Serving**

After upload, you should be able to access the image at:
```
http://localhost:3000/uploads/[filename]
```

### **Features of your upload system:**
- ✅ Automatic directory creation
- ✅ Unique filename generation (timestamp + original name)
- ✅ File type validation (images only)
- ✅ File size limit (5MB)
- ✅ Static file serving from `/uploads` directory
- ✅ Comprehensive error handling

**Test the upload endpoint and let me know what response you get!** 📸
