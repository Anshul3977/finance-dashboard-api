import { Router } from 'express';
import * as recordController from '../controllers/record.controller';
import { authenticate } from '../middleware/authenticate';
import { checkRole } from '../middleware/checkRole';
import { validate, validateQuery } from '../middleware/validate';
import { createRecordSchema, updateRecordSchema, filterSchema } from '../validators/record.validator';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /records:
 *   get:
 *     summary: Retrieve financial records
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: A paginated list of records
 *       401:
 *         description: Authentication required
 *       400:
 *         description: Validation failed
 */
router.get('/', validateQuery(filterSchema), recordController.getRecords);

/**
 * @swagger
 * /records:
 *   post:
 *     summary: Create a new financial record
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied (Analyst or Admin only)
 */
router.post(
  '/',
  checkRole('ANALYST', 'ADMIN'),
  validate(createRecordSchema),
  recordController.createRecord
);

/**
 * @swagger
 * /records/search:
 *   get:
 *     summary: Search records by category or notes (case-insensitive)
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string - searches in category and notes fields
 *     responses:
 *       200:
 *         description: Search results returned as JSON array (no pagination)
 *       400:
 *         description: Missing or empty search query (q parameter required)
 *       401:
 *         description: Authentication required
 */
router.get('/search', recordController.searchRecords);

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Get a specific record by ID
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record details
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied (You can only view your own records)
 *       404:
 *         description: Record not found
 */
router.get('/:id', recordController.getRecordById);

/**
 * @swagger
 * /records/{id}:
 *   put:
 *     summary: Update an existing financial record
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Record not found
 */
router.put(
  '/:id',
  checkRole('ANALYST', 'ADMIN'),
  validate(updateRecordSchema),
  recordController.updateRecord
);

/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     summary: Soft delete a financial record
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted successfully (soft delete)
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: Record not found
 */
router.delete('/:id', checkRole('ADMIN'), recordController.deleteRecord);

export default router;
