import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    senderEmail: { 
        type: String, required: true 
    },
    recipientEmail: { 
        type: String 
    },
    transactionType: { 
        type: String, enum: ['deposit', 'transfer']
    },
    amount: { 
        type: Number, required: true 
    },
    status: {
        type:String,
    },
    remarks: { 
        type: String 
    },
    timestamp: { 
        type: Date, default: Date.now
    }
});

const transaction = mongoose.model('transaction', transactionSchema);

export default transaction;