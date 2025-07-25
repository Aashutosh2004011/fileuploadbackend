import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

interface JwtPayload {
  id: string;
}

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new ErrorResponse('Not authorized to access this route', 401)
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new ErrorResponse('No user found with this id', 404));
      }

      (req as any).user = user;
      next();
    } catch (err) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  }
);