import { Request, Response, NextFunction } from 'express';
import Image from '../models/Image.js';
import Folder from '../models/Folder.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getFileUrl } from '../utils/fileUpload.js';
import path from 'path';
import fs from 'fs';


export const uploadImage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, folder } = req.body;
    const userId = (req as any).user._id;

    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    if (folder) {
      const folderExists = await Folder.findOne({
        _id: folder,
        user: userId,
      });

      if (!folderExists) {
        return next(new ErrorResponse('Folder not found', 404));
      }
    }

    const imageUrl = getFileUrl(req, req.file.filename);

    const image = await Image.create({
      name,
      user: userId,
      folder: folder || null,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      data: image,
    });
  }
);

export const getImages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { folder, search } = req.query;
    const userId = (req as any).user._id;

    let query: any = { user: userId };

    if (folder) {
      query.folder = folder;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const images = await Image.find(query).populate('folder', 'name');
    console.log('images: ', images);

    res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  }
);

export const searchImages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { q } = req.query;
    const userId = (req as any).user._id;
    console.log('userId: ', userId);

    if (!q) {
      return next(new ErrorResponse('Please provide a search term', 400));
    }

    const images = await Image.find({
      $text: { $search: q as string },
      user: userId,
    }).populate('folder', 'name');
    console.log('images: ', images);

    res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  }
);


export const deleteImage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const image = await Image.findOne({ _id: id, user: userId });
    
    if (!image) {
      return next(new ErrorResponse('Image not found or unauthorized', 404));
    }

    if (image.imageUrl) {
      try {
        const urlParts = image.imageUrl.split('uploads/');
        if (urlParts.length > 1) {
          const filename = urlParts[1];
          const filePath = path.join(__dirname, '../../uploads', filename);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
          } else {
            console.warn(`File not found: ${filePath}`);
          }
        }
      } catch (err) {
        console.error('Error deleting image file:', err);
      }
    }

    await Image.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      data: {},
      message: 'Image deleted successfully',
    });
  }
);