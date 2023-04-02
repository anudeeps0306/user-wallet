import express from 'express';
import { viewall,getallusers } from '../controllers/view.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();

const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Access denied. Please Login.' });
    }
  
    try {
      const decoded = jwt.verify(token, "hellothis");
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Invalid token. User not found.' });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Invalid token.' });
    }
};

router.get('/passbook',verifyToken, viewall);
router.get('/getallusers',verifyToken, getallusers);

export default router;