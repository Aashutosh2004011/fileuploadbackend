import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import ErrorResponse from './ErrorResponse.js';

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, process.env.FILE_UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Please upload an image file', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_UPLOAD) * 1024 * 1024 || 10 * 1024 * 1024,
  },
});

export const uploadImage = upload.single('image');

export const getFileUrl = (req: Request, filename: string) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};