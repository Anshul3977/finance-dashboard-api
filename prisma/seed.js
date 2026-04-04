"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// For Prisma v7 with pg adapter
async function main() {
    const { Pool } = await Promise.resolve().then(() => __importStar(require('pg')));
    const { PrismaPg } = await Promise.resolve().then(() => __importStar(require('@prisma/adapter-pg')));
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set');
    }
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new client_1.PrismaClient({ adapter });
    await seedDatabase(prisma);
    await prisma.$disconnect();
}
async function seedDatabase(prisma) {
    console.log('Seeding database...');
    // Hash passwords
    const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
    const analystPassword = await bcryptjs_1.default.hash('analyst123', 10);
    const viewerPassword = await bcryptjs_1.default.hash('viewer123', 10);
    // Clean existing data
    await prisma.financialRecord.deleteMany();
    await prisma.user.deleteMany();
    // Create Users
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@finance.com',
            password: adminPassword,
            role: client_1.Role.ADMIN,
        },
    });
    const analyst = await prisma.user.create({
        data: {
            name: 'Analyst User',
            email: 'analyst@finance.com',
            password: analystPassword,
            role: client_1.Role.ANALYST,
        },
    });
    const viewer = await prisma.user.create({
        data: {
            name: 'Viewer User',
            email: 'viewer@finance.com',
            password: viewerPassword,
            role: client_1.Role.VIEWER,
        },
    });
    console.log(`Created users: ${admin.email}, ${analyst.email}, ${viewer.email}`);
    // Create Financial Records
    const categories = ['Salary', 'Rent', 'Food', 'Transport', 'Utilities', 'Freelance', 'Investment'];
    const userIds = [admin.id, analyst.id, viewer.id];
    const records = [];
    for (let i = 0; i < 15; i++) {
        const isIncome = Math.random() > 0.5;
        const type = isIncome ? client_1.RecordType.INCOME : client_1.RecordType.EXPENSE;
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
//# sourceMappingURL=seed.js.map