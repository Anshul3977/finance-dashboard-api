import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/authenticate';
import { checkRole } from '../middleware/checkRole';

const router = Router();

// Dashboard routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get overall dashboard summary (Income, Expenses, Net)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get('/summary', dashboardController.summary);

/**
 * @swagger
 * /dashboard/categories:
 *   get:
 *     summary: Get breakdown of records grouped by category
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied (Analyst or Admin only)
 */
router.get('/categories', checkRole('ANALYST', 'ADMIN'), dashboardController.categoryBreakdown);

/**
 * @swagger
 * /dashboard/trends:
 *   get:
 *     summary: Get monthly income vs expenses trends
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trends fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied (Analyst or Admin only)
 */
router.get('/trends', checkRole('ANALYST', 'ADMIN'), dashboardController.monthlyTrends);

/**
 * @swagger
 * /dashboard/recent:
 *   get:
 *     summary: Get most recent financial activity
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent records to return
 *     responses:
 *       200:
 *         description: Recent activity fetched successfully
 *       401:
 *         description: Authentication required
 */
router.get('/recent', dashboardController.recentActivity);

/**
 * @swagger
 * /dashboard/export:
 *   get:
 *     summary: Export all financial records as JSON (Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All records exported successfully as JSON array with user names included
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           type:
 *                             type: string
 *                             enum: [INCOME, EXPENSE]
 *                           category:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           notes:
 *                             type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied (Admin only)
 */
router.get('/export', checkRole('ADMIN'), dashboardController.exportData);

export default router;
