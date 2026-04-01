import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export const summary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await dashboardService.getSummary(req.user!.id, req.user!.role);
    sendSuccess(res, data, 'Dashboard summary fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const categoryBreakdown = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await dashboardService.getCategoryBreakdown(req.user!.id, req.user!.role);
    sendSuccess(res, { categories: data }, 'Category breakdown fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const monthlyTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await dashboardService.getMonthlyTrends(req.user!.id, req.user!.role);
    sendSuccess(res, { trends: data }, 'Monthly trends fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const recentActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const data = await dashboardService.getRecentActivity(req.user!.id, req.user!.role, limit);
    sendSuccess(res, { recent: data }, 'Recent activity fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const exportData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const records = await dashboardService.exportRecords();
    sendSuccess(res, { records }, 'All records exported successfully');
  } catch (error) {
    next(error);
  }
};
