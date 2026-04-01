import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: 'API documentation for the Finance Dashboard backend system. Features RBAC, JWT Auth, and Aggregation pipelines.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication and profile routes' },
      { name: 'Users', description: 'User management and Access Control options' },
      { name: 'Records', description: 'Financial records operations' },
      { name: 'Dashboard', description: 'Aggregated summaries and financial analytics APIs' },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs inside routes
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
