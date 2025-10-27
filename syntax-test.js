// Simple syntax test
import express from 'express';

const app = express();
const PORT = 3000;

app.get('/test', (req, res) => {
  res.json({ message: 'Syntax is working!' });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
