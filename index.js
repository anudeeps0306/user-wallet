import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/user-wallet', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to database'))
.catch((error) => console.error('Error connecting to database:', error));


app.use('/auth', authRoutes);


app.listen(3000,() => {
    console.log('Listening on port 3000');
});





