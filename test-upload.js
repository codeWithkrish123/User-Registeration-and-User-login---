// Test script for image upload
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing image upload setup...\n');

// Check if uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
console.log('1. Checking uploads directory...');
if (fs.existsSync(uploadsDir)) {
  console.log('✅ uploads directory exists');
  console.log('📁 Directory path:', uploadsDir);

  // List files in uploads directory
  const files = fs.readdirSync(uploadsDir);
  console.log('📋 Files in uploads directory:', files.length > 0 ? files : 'No files yet');
} else {
  console.log('❌ uploads directory does not exist');
  console.log('💡 The server will create it automatically when first upload happens');
}

console.log('\n2. Upload endpoint configuration:');
console.log('📡 URL: http://localhost:3000/api/auth/upload');
console.log('📤 Method: POST');
console.log('📎 Content-Type: multipart/form-data');
console.log('🖼️ Field name: image');
console.log('📏 Max file size: 5MB');
console.log('🖼️ Allowed formats: Images only (jpg, png, gif, etc.)');

console.log('\n3. Expected response format:');
console.log(`{
  "message": "Image uploaded successfully",
  "filename": "1640995200000-image.jpg",
  "originalname": "image.jpg",
  "size": 1024000,
  "url": "/uploads/1640995200000-image.jpg"
}`);

console.log('\n4. Access uploaded images at:');
console.log('🌐 http://localhost:3000/uploads/[filename]');

console.log('\n✅ Upload endpoint is ready to test!');
