import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      trim: true
    },
    balance: {
      type: Number,
      required: true,
      default: 0
    }
  });
  
const wallet = mongoose.model('Wallet', walletSchema);

export default wallet;