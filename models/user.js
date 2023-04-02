import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    isAdmin: {
        type : Boolean,
    }
});

const user = mongoose.model('User', userSchema);

export default user;