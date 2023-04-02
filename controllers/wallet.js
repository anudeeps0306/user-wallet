import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Transaction from '../models/transaction.js';
import Wallet from '../models/wallet.js';
import mongoose from 'mongoose';
import Joi from 'joi';

const addmoneySchema = Joi.object({
  email: Joi.string().email().required(),
  wallet_password: Joi.string().required(),
  amount: Joi.number().min(0).required()
});


const sendMoneySchema = Joi.object({
  user: Joi.string().email().required(),
  recipientEmail: Joi.string().email().required(),
  amount: Joi.number().positive().required(),
  wallet_password: Joi.string().required(),
});



export const addmoney = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = addmoneySchema.validate(req.body);
        if (error) {
          return res.status(400).json({ message: error.details[0].message });
        }

        const { email, wallet_password, amount } = req.body;
        const walletObj = await Wallet.findOne({ email });
        if (!walletObj) {
          return res.status(404).json({ message: 'Wallet not found' });
        }
        const wallet = walletObj.password;
      
        const isMatch = await bcrypt.compare(wallet_password, wallet);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid wallet password' });
        }
      
        const newBalance = parseInt(walletObj.balance) + parseInt(amount);
        walletObj.balance = newBalance;
        
        await walletObj.save();
      
        // Add transaction record
        const transaction = new Transaction({
            senderEmail: walletObj.email,
            amount: amount,
            transactionType: 'deposit',
            status: 'success',
            remarks: 'Money deposited successfully',
            timestamp: Date.now()
        });
        await transaction.save();
      
        return res.json({ message: 'Money added successfully', balance: newBalance });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      
};


// This is by using transaction , but it only works when we Launch multiple MongoDB instances on separate servers.




// export const  sendmoney = async (req, res) => {
//     try {
//         // Extract necessary information from request body
//         const { user, recipientEmail, amount, wallet_password } = req.body;
      
//         // Find sender and recipient wallets
//         const senderWallet = await Wallet.findOne({ email: user });
//         const recipientWallet = await Wallet.findOne({ email: recipientEmail });
      
//         // Check if sender wallet exists
//         if (!senderWallet) {
//           return res.status(404).json({ message: 'Sender wallet not found' });
//         }
      
//         // Check if recipient wallet exists
//         if (!recipientWallet) {
//           return res.status(404).json({ message: 'Recipient wallet not found' });
//         }
      
//         // Check if sender has enough balance
//         if (senderWallet.balance < amount) {
//           return res.status(400).json({ message: 'Insufficient balance' });
//         }
      
//         // Check if wallet password is correct
//         const isMatch = await bcrypt.compare(wallet_password, senderWallet.password);
//         if (!isMatch) {
//           return res.status(401).json({ message: 'Invalid wallet password' });
//         }
      
//         // Deduct money from sender's wallet
//         const newSenderBalance = senderWallet.balance - amount;
//         senderWallet.balance = newSenderBalance;
      
//         // Add money to recipient's wallet
//         const newRecipientBalance = recipientWallet.balance + amount;
//         recipientWallet.balance = newRecipientBalance;
      
//         // Start transaction
//         const session = await mongoose.startSession();
//         session.startTransaction();
      
//         try {
//           // Save sender and recipient wallets
//           await senderWallet.save({ session });
//           await recipientWallet.save({ session });
      
//           // Add transaction records
//           const senderTransaction = new Transaction({
//             senderEmail: user,
//             recipientEmail: recipientEmail,
//             amount: amount,
//             transactionType: 'transfer',
//             status: 'success',
//             remarks: 'Money sent successfully',
//             timestamp: Date.now()
//           });
//           await senderTransaction.save({ session });
      
//           const recipientTransaction = new Transaction({
//             senderEmail: recipientEmail,
//             recipientEmail: user,
//             amount: amount,
//             transactionType: 'transfer',
//             status: 'success',
//             remarks: 'Money received successfully',
//             timestamp: Date.now()
//           });
//           await recipientTransaction.save({ session });
      
//           // Commit transaction
//           await session.commitTransaction();
//           session.endSession();
      
//           return res.json({ message: 'Money sent successfully', senderBalance: newSenderBalance });
//         } catch (error) {
//           // Rollback transaction
//           await session.abortTransaction();
//           session.endSession();
      
//           console.error(error);
//           const transaction = new Transaction({
//             senderEmail: user,
//             recipientEmail: recipientEmail,
//             amount: amount,
//             transactionType: 'transfer',
//             status: 'failure',
//             remarks: 'Transaction failed',
//             timestamp: Date.now()
//           });
//           await transaction.save();
//           return res.status(500).json({ message: 'Internal server error' });
//         }
//       } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Internal server error' });
//       }
      
// };


export const sendmoney = async (req, res) => {
    try {

      const { error } = sendMoneySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      // Extract necessary information from request body
      const { user, recipientEmail, amount, wallet_password } = req.body;
      
      // Find sender and recipient wallets
      const senderWallet = await Wallet.findOne({ email: user });
      const recipientWallet = await Wallet.findOne({ email: recipientEmail });
  
      // Check if sender wallet exists
      if (!senderWallet) {
        return res.status(404).json({ message: 'Sender wallet not found' });
      }
  
      // Check if recipient wallet exists
      if (!recipientWallet) {
        return res.status(404).json({ message: 'Recipient wallet not found' });
      }
  
      // Check if sender has enough balance
      if (senderWallet.balance < amount) {
        const senderTransactionFailed = new Transaction({
            senderEmail: recipientEmail,
            recipientEmail: user,
            amount: amount,
            transactionType: 'transfer',
            status: 'failed',
            remarks: 'Insufficient balance',
            timestamp: Date.now()
        });
        await senderTransactionFailed.save();
        return res.status(400).json({ message: 'Insufficient balance' });
      }
  
      // Check if wallet password is correct
      const isMatch = await bcrypt.compare(wallet_password, senderWallet.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid wallet password' });
      }
  
      // Deduct money from sender's wallet
      const newSenderBalance = senderWallet.balance - amount;
      senderWallet.balance = newSenderBalance;
      await senderWallet.save();
  
      // Add money to recipient's wallet
      const newRecipientBalance = recipientWallet.balance + amount;
      recipientWallet.balance = newRecipientBalance;
      await recipientWallet.save();
  
      // Add transaction records
      const senderTransaction = new Transaction({
        senderEmail: user,
        recipientEmail: recipientEmail,
        amount: amount,
        transactionType: 'transfer',
        status: 'success',
        remarks: 'Money sent successfully',
        timestamp: Date.now()
      });
      await senderTransaction.save();
  
      const recipientTransaction = new Transaction({
        senderEmail: recipientEmail,
        recipientEmail: user,
        amount: amount,
        transactionType: 'transfer',
        status: 'success',
        remarks: 'Money received successfully',
        timestamp: Date.now()
      });
      await recipientTransaction.save();
  
      return res.json({ message: 'Money sent successfully', senderBalance: newSenderBalance });
    } catch (error) {
      console.error(error);
      const transaction = new Transaction({
        senderEmail: req.body.user,
        recipientEmail: req.body.recipientEmail,
        amount: req.body.amount,
        transactionType: 'transfer',
        status: 'failure',
        remarks: 'Transaction failed',
        timestamp: Date.now()
      });
      await transaction.save();
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  