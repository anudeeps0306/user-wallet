import transaction from "../models/transaction.js";
import User from "../models/user.js";
import Wallet from "../models/wallet.js";
import Joi from 'joi';

const viewAllSchema = Joi.object({
  user: Joi.string().required(),
});

export const viewall = async (req, res) => {

    const { error } = viewAllSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const userEmail = req.body.user;
    const userTransactions = await transaction.find({
        $or: [{ senderEmail: userEmail }, { recipientEmail: userEmail }]
    });
      
    return res.json(userTransactions);
};


const getUserIsAdmin = async (email) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }
      return user.isAdmin;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get user isAdmin status');
    }
};

export const getallusers = async (req, res) =>  {
    try {
      const isAdmin = await getUserIsAdmin(req.user.email);
      if (!isAdmin) {
        return res.status(401).json({ message: 'Access denied' });
      }
      const users = await Wallet.find({}, { email: 1, accountNumber: 1, balance: 1 });
      console.log(users);

      return res.json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
};
  

  