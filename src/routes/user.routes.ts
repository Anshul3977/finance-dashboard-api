import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { checkRole } from '../middleware/checkRole';
import { validate } from '../middleware/validate';
import { roleSchema, statusSchema } from '../validators/user.validator';

const router = Router();

// All routes require ADMIN role
router.use(authenticate, checkRole('ADMIN'));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of all users
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users.
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied (Admin only)
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
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
 *         description: User details fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: User not found
 */
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Update a user's role
 *     tags: [Users]
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [VIEWER, ANALYST, ADMIN]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: User not found
 */
router.patch('/:id/role', validate(roleSchema), userController.updateUserRole);

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Update a user's status
 *     tags: [Users]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: User not found
 */
router.patch('/:id/status', validate(statusSchema), userController.updateUserStatus);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user 
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: User not found
 */
router.delete('/:id', userController.deleteUser);

export default router;
