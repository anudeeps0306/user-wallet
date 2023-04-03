import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Wallet from '../models/wallet.js';
import crypto from 'crypto';
import validator from 'validator';
import Joi from 'joi';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  wallet_password: Joi.string().min(6).max(6).required(),
});

// Joi schema for user login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const register = async (req, res) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ message: error.details[0].message });
        }
        const { email, password,wallet_password } = req.body;
        console.log(req.body);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (!email || !password || !wallet_password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (!validator.isLength(wallet_password, { min: 6, max: 6 })) {
            return res.status(400).json({ message: 'Password must be 6 characters long' });
        }

        const timestamp = Date.now().toString();
        const accountNumber = email + timestamp;
        const hash = crypto.createHash('sha256').update(accountNumber).digest('hex');
        const readableAccountNumber = hash.substring(0, 20);
        console.log(readableAccountNumber);

        const hashwalletPassword = await bcrypt.hash(wallet_password, 10);

        const wallet = new Wallet({ email,  accountNumber:readableAccountNumber, password:hashwalletPassword, balance: 0 });

        await wallet.save();

        // create new user with wallet reference
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, wallet: wallet._id });
        await user.save();

        const token = jwt.sign({ id: user._id },"hellothis");
        return res.json({ token, readableAccountNumber });
        } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



export const login = async (req, res) => {
    try {
      const { error } = loginSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ message: error.details[0].message });
      }
      const { email, password } = req.body;
      const user = await User.findOne({ email }).populate('wallet');
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      const token = jwt.sign({ id: user._id }, "hellothis");
      res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
      return res.json({
        user: {
          name: user.name,
          email: user.email,
          wallet: user.wallet
        },
        token
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
};
  