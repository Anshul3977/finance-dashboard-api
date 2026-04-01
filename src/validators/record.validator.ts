import { z } from 'zod';

export const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  date: z.string().transform((val) => new Date(val)),
  notes: z.string().optional(),
});

export const updateRecordSchema = z.object({
  amount: z.number().positive('Amount must be a positive number').optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().min(2, 'Category must be at least 2 characters').optional(),
  date: z.string().transform((val) => new Date(val)).optional(),
  notes: z.string().optional(),
});

export const filterSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(10),
});
