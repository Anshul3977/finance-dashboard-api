import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';

interface RecordData {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: Date;
  notes?: string;
}

interface FilterParams {
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

export async function createRecord(userId: string, data: RecordData) {
  const record = await prisma.financialRecord.create({
    data: {
      ...data,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return record;
}

export async function getRecords(userId: string, role: string, filters: FilterParams) {
  const { type, category, startDate, endDate, page, limit } = filters;

  const where: Prisma.FinancialRecordWhereInput = {
    isDeleted: false,
  };

  // VIEWER can only see own records
  if (role === 'VIEWER') {
    where.userId = userId;
  }

  // Apply filters
  if (type) {
    where.type = type;
  }

  if (category) {
    where.category = {
      contains: category,
      mode: 'insensitive',
    };
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      (where.date as Prisma.DateTimeFilter).gte = new Date(startDate);
    }
    if (endDate) {
      (where.date as Prisma.DateTimeFilter).lte = new Date(endDate);
    }
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  return {
    records,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getRecordById(id: string, userId: string, role: string) {
  const record = await prisma.financialRecord.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!record) {
    throw new AppError('Record not found', 404);
  }

  // VIEWER can only see own records
  if (role === 'VIEWER' && record.userId !== userId) {
    throw new AppError('Access denied: you can only view your own records', 403);
  }

  return record;
}

export async function updateRecord(
  id: string,
  userId: string,
  role: string,
  data: Partial<RecordData>
) {
  const record = await prisma.financialRecord.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!record) {
    throw new AppError('Record not found', 404);
  }

  // VIEWER and ANALYST can only update own records
  if ((role === 'VIEWER' || role === 'ANALYST') && record.userId !== userId) {
    throw new AppError('Access denied: you can only update your own records', 403);
  }

  const updated = await prisma.financialRecord.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updated;
}

export async function deleteRecord(id: string) {
  const record = await prisma.financialRecord.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!record) {
    throw new AppError('Record not found', 404);
  }

  // Soft delete
  const deleted = await prisma.financialRecord.update({
    where: { id },
    data: { isDeleted: true },
  });

  return deleted;
}

export async function searchRecords(userId: string, role: string, query: string) {
  const where: Prisma.FinancialRecordWhereInput = {
    isDeleted: false,
    OR: [
      {
        category: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        notes: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ],
  };

  // VIEWER can only see own records
  if (role === 'VIEWER') {
    where.userId = userId;
  }

  const records = await prisma.financialRecord.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return records;
}
