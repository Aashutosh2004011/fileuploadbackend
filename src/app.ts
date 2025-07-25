import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import folderRouter from './routes/folder.js';
import imageRouter from './routes/image.js';
import errorHandler from './utils/error.js';
import fs from 'fs';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/folders', folderRouter);
app.use('/api/v1/images', imageRouter);

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

app.use('/uploads', express.static(uploadsDir));

app.use(errorHandler);

export default app;