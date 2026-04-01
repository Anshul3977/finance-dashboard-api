import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { sendSuccess } from '../utils/response';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    sendSuccess(res, { users }, 'Users fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.getUserById(req.params.id as string);
    sendSuccess(res, { user }, 'User fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.updateUserRole(req.params.id as string, req.body.role);
    sendSuccess(res, { user }, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.updateUserStatus(req.params.id as string, req.body.status);
    sendSuccess(res, { user }, 'User status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await userService.deleteUser(req.params.id as string);
    // Use res.status(204).send() directly for 204 No Content
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
