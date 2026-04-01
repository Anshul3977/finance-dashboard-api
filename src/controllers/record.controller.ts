import { Request, Response, NextFunction } from 'express';
import * as recordService from '../services/record.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';

export const createRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await recordService.createRecord(req.user!.id, req.body);
    sendSuccess(res, { record }, 'Record created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.query is already validated and cast by validateQuery middleware
    const filters = req.query as any;
    const result = await recordService.getRecords(req.user!.id, req.user!.role, filters);
    sendSuccess(res, result, 'Records fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getRecordById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await recordService.getRecordById(
      req.params.id as string,
      req.user!.id,
      req.user!.role
    );
    sendSuccess(res, { record }, 'Record fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await recordService.updateRecord(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
      req.body
    );
    sendSuccess(res, { record }, 'Record updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await recordService.deleteRecord(req.params.id as string);
    sendSuccess(res, null, 'Record deleted successfully (soft delete)');
  } catch (error) {
    next(error);
  }
};

export const searchRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      throw new AppError('Search query (q parameter) is required', 400);
    }
    
    const records = await recordService.searchRecords(req.user!.id, req.user!.role, query);
    sendSuccess(res, { records }, `Search results for "${query}"`);
  } catch (error) {
    next(error);
  }
};
