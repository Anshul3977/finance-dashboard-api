import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import recordRoutes from './routes/record.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Finance Dashboard API is running',
    timestamp: new Date().toISOString(),
  });
});

// Swagger Docs mounting
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/records', recordRoutes);
app.use('/dashboard', dashboardRoutes);

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler must be the last middleware
app.use(errorHandler);

export default app;
