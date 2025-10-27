import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('Health status:', healthData);
    console.log('');

    // Test users endpoint
    console.log('2. Testing users endpoint...');
    const usersResponse = await fetch('http://localhost:3000/api/users');
    const usersData = await usersResponse.json();
    console.log('Users response:', usersData);
    console.log('');

    // Test registration (if no users exist)
    if (!usersData || usersData.length === 0) {
      console.log('3. Testing registration...');
      const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
      });
      const registerData = await registerResponse.json();
      console.log('Registration response:', registerData);
      console.log('');
    }

    // Test login
    console.log('4. Testing login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    console.log('Login status:', loginResponse.status);

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - Server is running: npm start');
    console.log('   - MongoDB is running: mongod');
    console.log('   - Or use MongoDB Atlas connection string');
  }
}

testAPI();
