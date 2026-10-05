const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));

app.use(express.json());

// frontend
app.use(express.static(path.resolve(__dirname, '../frontend')));

// API routes
app.use('/api/auth', require('./routes/AuthService'));
app.use('/api/food', require('./routes/FoodService'));
app.use('/api/search', require('./routes/SearchService'));

// error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  res.status(500).json({
    success: false,
    message: '伺服器內部錯誤'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server：http://localhost:${PORT}`);
});