import prisma from '../utils/prisma';


export const getSummary = async (userId: string, role: string) => {
  const whereClause = role === 'VIEWER' ? { userId, isDeleted: false } : { isDeleted: false };
  
  const aggregates = await prisma.financialRecord.groupBy({
    by: ['type'],
    where: whereClause,
    _sum: { amount: true },
  });

  let totalIncome = 0;
  let totalExpenses = 0;

  aggregates.forEach((agg: any) => {
    if (agg.type === 'INCOME') totalIncome += agg._sum.amount ?? 0;
    if (agg.type === 'EXPENSE') totalExpenses += agg._sum.amount ?? 0;
  });

  const totalRecords = await prisma.financialRecord.count({ where: whereClause });

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalRecords,
  };
};

export const getCategoryBreakdown = async (userId: string, role: string) => {
  const whereClause = role === 'VIEWER' ? { userId, isDeleted: false } : { isDeleted: false };

  const aggregates = await prisma.financialRecord.groupBy({
    by: ['category', 'type'],
    where: whereClause,
    _sum: { amount: true },
  });

  const categoryMap: Record<string, { category: string; totalIncome: number; totalExpenses: number; net: number }> = {};

  aggregates.forEach((agg: any) => {
    const { category, type } = agg;
    const amount = agg._sum.amount ?? 0;
    
    if (!categoryMap[category]) {
      categoryMap[category] = { category, totalIncome: 0, totalExpenses: 0, net: 0 };
    }

    if (type === 'INCOME') {
      categoryMap[category].totalIncome += amount;
    } else {
      categoryMap[category].totalExpenses += amount;
    }
  });

  return Object.values(categoryMap).map(c => ({
    ...c,
    net: c.totalIncome - c.totalExpenses
  }));
};

export const getMonthlyTrends = async (userId: string, role: string) => {
  const whereClause = role === 'VIEWER' ? { userId, isDeleted: false } : { isDeleted: false };
  
  // To keep it simple and DB-agnostic in logic, we'll fetch partial data or use queryRaw.
  // Using queryRaw for PostgreSQL:
  
  if (role === 'VIEWER') {
    const rawResult: any[] = await prisma.$queryRaw`
      SELECT 
        to_char("date", 'YYYY-MM') as month,
        SUM(CASE WHEN "type" = 'INCOME' THEN "amount" ELSE 0 END) as income,
        SUM(CASE WHEN "type" = 'EXPENSE' THEN "amount" ELSE 0 END) as expenses
      FROM "FinancialRecord"
      WHERE "isDeleted" = false AND "userId" = ${userId}
      GROUP BY to_char("date", 'YYYY-MM')
      ORDER BY month ASC
    `;
    return rawResult.map(r => ({
      month: r.month,
      income: Number(r.income || 0),
      expenses: Number(r.expenses || 0),
      net: Number(r.income || 0) - Number(r.expenses || 0)
    }));
  } else {
    const rawResult: any[] = await prisma.$queryRaw`
      SELECT 
        to_char("date", 'YYYY-MM') as month,
        SUM(CASE WHEN "type" = 'INCOME' THEN "amount" ELSE 0 END) as income,
        SUM(CASE WHEN "type" = 'EXPENSE' THEN "amount" ELSE 0 END) as expenses
      FROM "FinancialRecord"
      WHERE "isDeleted" = false
      GROUP BY to_char("date", 'YYYY-MM')
      ORDER BY month ASC
    `;
    return rawResult.map(r => ({
      month: r.month,
      income: Number(r.income || 0),
      expenses: Number(r.expenses || 0),
      net: Number(r.income || 0) - Number(r.expenses || 0)
    }));
  }
};

export const getRecentActivity = async (userId: string, role: string, limit: number = 10) => {
  const whereClause = role === 'VIEWER' ? { userId, isDeleted: false } : { isDeleted: false };

  const records = await prisma.financialRecord.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: role === 'VIEWER' ? false : { select: { name: true, email: true } }
    }
  });

  return records;
};

export const exportRecords = async () => {
  const records = await prisma.financialRecord.findMany({
    where: { isDeleted: false },
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
};
