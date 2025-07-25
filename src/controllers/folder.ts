import { Request, Response, NextFunction } from 'express';
import Folder from '../models/Folder.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

export const getFolders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const folders = await Folder.find({ user: (req as any).user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: folders.length,
      data: folders,
    });
  }
);

export const getFolder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const folder = await Folder.findOne({
      _id: req.params.id,
      user: (req as any).user._id,
    });

    if (!folder) {
      return next(
        new ErrorResponse(`Folder not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: folder,
    });
  }
);

export const createFolder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, parentFolder } = req.body;
    const userId = (req as any).user._id;

    if (!name || name.trim().length === 0) {
      return next(new ErrorResponse('Folder name is required', 400));
    }

    if (name.length > 50) {
      return next(new ErrorResponse('Folder name must be less than 50 characters', 400));
    }

    const invalidChars = /[/\\:*?"<>|]/;
    if (invalidChars.test(name)) {
      return next(new ErrorResponse('Folder name contains invalid characters', 400));
    }

    let path: string[] = [];
    let parent = null;

    if (parentFolder) {
      parent = await Folder.findOne({ _id: parentFolder, user: userId });
      if (!parent) {
        return next(new ErrorResponse('Parent folder not found', 404));
      }
      path = [...parent.path, parent.name];
    }

    const existingFolder = await Folder.findOne({
      name: name.trim(),
      user: userId,
      parentFolder: parentFolder || null,
    });

    if (existingFolder) {
      return next(new ErrorResponse('A folder with this name already exists in this location', 400));
    }

    const folder = await Folder.create({
      name: name.trim(),
      user: userId,
      parentFolder: parentFolder || null,
      path,
    });

    res.status(201).json({
      success: true,
      data: folder,
    });
  }
);

export const updateFolder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
    const userId = (req as any).user._id;

    if (!name || name.trim().length === 0) {
      return next(new ErrorResponse('Folder name is required', 400));
    }

    if (name.length > 50) {
      return next(new ErrorResponse('Folder name must be less than 50 characters', 400));
    }

    const invalidChars = /[/\\:*?"<>|]/;
    if (invalidChars.test(name)) {
      return next(new ErrorResponse('Folder name contains invalid characters', 400));
    }

    const folder = await Folder.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!folder) {
      return next(new ErrorResponse(`Folder not found with id of ${req.params.id}`, 404));
    }

    const existingFolder = await Folder.findOne({
      name: name.trim(),
      user: userId,
      parentFolder: folder.parentFolder,
      _id: { $ne: req.params.id },
    });

    if (existingFolder) {
      return next(new ErrorResponse('A folder with this name already exists in this location', 400));
    }

    folder.name = name.trim();
    await folder.save();

    res.status(200).json({
      success: true,
      data: folder,
    });
  }
);

export const deleteFolder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;

    const folder = await Folder.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!folder) {
      return next(new ErrorResponse(`Folder not found with id of ${req.params.id}`, 404));
    }

    const childFolders = await Folder.find({
      parentFolder: req.params.id,
      user: userId,
    });

    if (childFolders.length > 0) {
      return next(new ErrorResponse('Cannot delete folder that contains subfolders', 400));
    }

    await folder.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

export const getFolderTree = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;

    const allFolders = await Folder.find({ user: userId })
      .sort({ name: 1 })
      .lean();

    const folderMap = new Map();
    const rootFolders: any[] = [];

    allFolders.forEach(folder => {
      folderMap.set(folder._id.toString(), {
        ...folder,
        children: []
      });
    });

    allFolders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder._id.toString());
      
      if (folder.parentFolder) {
        const parent = folderMap.get(folder.parentFolder.toString());
        if (parent) {
          parent.children.push(folderWithChildren);
        }
      } else {
        rootFolders.push(folderWithChildren);
      }
    });

    const sortFolderTree = (folders: any[]) => {
      folders.sort((a, b) => a.name.localeCompare(b.name));
      folders.forEach(folder => {
        if (folder.children.length > 0) {
          sortFolderTree(folder.children);
        }
      });
    };

    sortFolderTree(rootFolders);

    res.status(200).json({
      success: true,
      data: rootFolders,
    });
  }
);