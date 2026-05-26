export function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'] || req.body.UserID;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
  }
  
  req.userId = userId;
  next();
}
