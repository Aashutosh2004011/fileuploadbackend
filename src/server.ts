import mongoose from 'mongoose';
import app from './app.js'; 
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
console.log('PORT: ', PORT);
const MONGODB_URI = process.env.MONGODB_URI || '';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });