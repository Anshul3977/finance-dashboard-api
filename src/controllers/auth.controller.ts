import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import prisma from '../utils/prisma';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await registerUser(req.body);
    sendSuccess(res, { user }, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    sendSuccess(res, result, 'Login successful', 200);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    sendSuccess(res, { user }, 'Current user fetched successfully', 200);
  } catch (error) {
    next(error);
  }
};
