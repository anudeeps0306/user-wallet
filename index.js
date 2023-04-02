import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import walletRoutes from './routes/wallet.js';
import cookieParser from 'cookie-parser';
import viewRoutes from './routes/view.js';
import winston from 'winston';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
      winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}] [API] ${info.message}`)
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/api.log' })
    ]
});


mongoose.connect('mongodb://localhost:27017/user-wallet', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to database'))
.catch((error) => console.error('Error connecting to database:', error));

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`, { data: req.body });
    next();
});

app.use('/auth', authRoutes);
app.use('/wallet', walletRoutes);
app.use('/view', viewRoutes);


app.listen(3000,() => {
    console.log('Listening on port 3000');
});





