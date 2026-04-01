import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'VIEWER' | 'ANALYST' | 'ADMIN';
}

export async function registerUser(data: RegisterData) {
  // Check if email already taken
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'VIEWER',
    },
  });

  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function loginUser(email: string, password: string) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user is active
  if (user.status !== 'ACTIVE') {
    throw new AppError('Account is inactive. Please contact an administrator.', 401);
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate token
  const token = generateToken(user.id, user.role);

  // Return user without password and token
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}
