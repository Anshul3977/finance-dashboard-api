import { PrismaClient, Role, RecordType } from '@prisma/client';
import bcrypt from 'bcryptjs';

// For Prisma v7 with pg adapter
async function main() {
  const { Pool } = await import('pg');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  await seedDatabase(prisma);
  await prisma.$disconnect();
}

async function seedDatabase(prisma: PrismaClient) {
  console.log('Seeding database...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const analystPassword = await bcrypt.hash('analyst123', 10);
  const viewerPassword = await bcrypt.hash('viewer123', 10);

  // Clean existing data
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@finance.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'Analyst User',
      email: 'analyst@finance.com',
      password: analystPassword,
      role: Role.ANALYST,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: 'Viewer User',
      email: 'viewer@finance.com',
      password: viewerPassword,
      role: Role.VIEWER,
    },
  });

  console.log(`Created users: ${admin.email}, ${analyst.email}, ${viewer.email}`);

  // Create Financial Records
  const categories = ['Salary', 'Rent', 'Food', 'Transport', 'Utilities', 'Freelance', 'Investment'];
  const userIds = [admin.id, analyst.id, viewer.id];
  const records = [];

  for (let i = 0; i < 15; i++) {
    const isIncome = Math.random() > 0.5;
    const type = isIncome ? RecordType.INCOME : RecordType.EXPENSE;
    const category = isIncome 
      ? ['Salary', 'Freelance', 'Investment'][Math.floor(Math.random() * 3)]
      : ['Rent', 'Food', 'Transport', 'Utilities'][Math.floor(Math.random() * 4)];
    
    const amount = Number((Math.random() * (isIncome ? 5000 : 2000) + 100).toFixed(2));
    
    // Spread dates across last 6 months
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
    date.setDate(Math.floor(Math.random() * 28) + 1);

    const userId = userIds[Math.floor(Math.random() * userIds.length)];

    records.push({
      userId,
      amount,
      type,
      category,
      date,
      notes: `Seed record ${i + 1}`,
    });
  }

  await prisma.financialRecord.createMany({
    data: records,
  });

  console.log(`Created 15 financial records distributed among users.`);
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  });
