const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '請先登入' });
  }

  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret_key_for_dev'
    );
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token 無效' });
  }
}

module.exports = authMiddleware;