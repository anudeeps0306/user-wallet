import express from 'express';
import { addmoney,sendmoney} from '../controllers/wallet.js';
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

router.post('/addmoney',verifyToken, addmoney);
router.post('/sendmoney',verifyToken, sendmoney);


export default router;