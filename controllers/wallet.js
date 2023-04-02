import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Wallet from '../models/wallet.js';


export const addmoney = async (req, res) => {
    try {
        const { email, wallet_password, amount } = req.body;
        const walletObj = await Wallet.findOne({ email });
        if (!walletObj) {
          return res.status(404).json({ message: 'Wallet not found' });
        }
        const wallet = walletObj.password;
        // console.log(wallet_password,wallet);
        const isMatch = await bcrypt.compare(wallet_password, wallet);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid wallet password' });
        }
        const newBalance = walletObj.balance + amount;
        walletObj.balance = newBalance;
        await walletObj.save();
        return res.json({ message: 'Money added successfully', balance: newBalance });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
      
};