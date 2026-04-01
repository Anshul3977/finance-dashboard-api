import { z } from 'zod';

export const roleSchema = z.object({
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN'], {
    message: 'Role must be VIEWER, ANALYST, or ADMIN',
  }),
});

export const statusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    message: 'Status must be ACTIVE or INACTIVE',
  }),
});
