import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import walletRoutes from './routes/wallet.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


mongoose.connect('mongodb://localhost:27017/user-wallet', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to database'))
.catch((error) => console.error('Error connecting to database:', error));


app.use('/auth', authRoutes);
app.use('/wallet', walletRoutes);


app.listen(3000,() => {
    console.log('Listening on port 3000');
});





