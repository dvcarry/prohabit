const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const response = jwt.decode(token)
      req.user_id = response.user_id;
    }
    next();
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};