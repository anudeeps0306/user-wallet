import express from 'express';
import { addmoney} from '../controllers/wallet.js';

const router = express.Router();

router.post('/addmoney', addmoney);


export default router;