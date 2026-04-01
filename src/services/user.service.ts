import prisma from '../utils/prisma';
import { AppError } from '../utils/AppError';

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return users;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

export async function updateUserRole(id: string, role: 'VIEWER' | 'ANALYST' | 'ADMIN') {
  // Check user exists
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('User not found', 404);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
  // Check user exists
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('User not found', 404);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function deleteUser(id: string) {
  // Check user exists
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('User not found', 404);
  }

  await prisma.user.delete({ where: { id } });
}
