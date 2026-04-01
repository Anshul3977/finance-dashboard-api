# Finance Dashboard API

## Overview
The Finance Dashboard API is a robust, secure backend system designed to track personal or corporate financial records. It provides users with a way to categorize and log income and expenses, complete with a powerful analytics dashboard that generates summaries, category breakdowns, and monthly trends. The API supports a strict Role-Based Access Control (RBAC) model, ensuring that specific analytics and user management actions are locked safely behind administrative clearances.

## Tech Stack
| Technology | Description |
|---|---|
| **Node.js + Express** | High-performance Javascript backend runtime running the REST API. |
| **TypeScript** | Strongly typed Javascript for better maintainability and error catching. |
| **PostgreSQL** | Reliable, ACID-compliant relational database. |
| **Prisma ORM** | Next-generation Node.js ORM for seamless type-safe database queries. |
| **JWT & bcryptjs** | Stateless authentication layer and password hashing. |
| **Zod** | Schema validation for strict request payloads checking. |
| **Swagger UI** | Auto-generated, interactive API endpoints documentation. |

## Features
- **Role-based Access Control**: Three tiered roles (`VIEWER`, `ANALYST`, `ADMIN`) controlling access to administrative dashboard components and other users' records.
- **Financial Records CRUD**: Highly dynamic record keeping supporting categorizations, notations, and dates.
- **Dashboard Analytics**: Database-level groupings calculating net balances, category-specific income, and historic trends.
- **JWT Authentication**: Full Registration & Login system protected with secure encryption.
- **Robust Input Validation**: Strict validation middleware guarding all POST and PUT requests utilizing `Zod`.
- **Soft Delete System**: Auditable content structure ensuring deleted records are retained out-of-view instead of permanently erased.
- **Pagination & Filtering**: Scale-ready endpoints filtering large payloads using date bounds, category matches, and limits.
- **Swagger Documentation**: Live, browsable interface testing and documenting all routes.

## Setup Instructions
1. Clone the repository and navigate to its directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` into `.env` (or create a `.env` file) and fill in the values:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/finance_dashboard?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3000
   ```
4. Push Prisma schema to update the database state and generate the client library:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
5. Seed the database with mocked user configurations and financial statements:
   ```bash
   npx prisma db seed
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```
*Access interactive API Documentation at: `http://localhost:3000/api-docs`*

## Environment Variables
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/finance` |
| `JWT_SECRET` | Secret string mapping JWT signatures | `super_secret_v1_key` |
| `PORT` | Listening port for the application | `3000` |
| `NODE_ENV` | Environment identifier | `development` or `production` |

## API Endpoints

### Auth
| Method | Path | Auth Required | Roles Allowed | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | No | All | Register a new user account |
| `POST` | `/auth/login` | No | All | Exchange credentials for a JWT payload |
| `GET` | `/auth/me` | Yes | All | Returns currently authenticated user details |

### Users
| Method | Path | Auth Required | Roles Allowed | Description |
|---|---|---|---|---|
| `GET` | `/users` | Yes | `ADMIN` | Fetch all user profiles |
| `GET` | `/users/:id` | Yes | `ADMIN` | Fetch single user by ID |
| `PATCH` | `/users/:id/role` | Yes | `ADMIN` | Update a user's RBAC role |
| `PATCH` | `/users/:id/status`| Yes | `ADMIN` | Toggle a user's ACTIVE/INACTIVE state |
| `DELETE`| `/users/:id` | Yes | `ADMIN` | Permanently delete a user |

### Records
| Method | Path | Auth Required | Roles Allowed | Description |
|---|---|---|---|---|
| `GET` | `/records` | Yes | All | Fetch paginated & filtered records (`VIEWER` only sees theirs) |
| `POST` | `/records` | Yes | `ANALYST`, `ADMIN` | Create a new financial record |
| `GET` | `/records/:id` | Yes | All | Fetch specific record |
| `PUT` | `/records/:id` | Yes | `ANALYST`, `ADMIN` | Update an existing financial record |
| `DELETE`| `/records/:id` | Yes | `ADMIN` | Soft delete a financial record |

### Dashboard
| Method | Path | Auth Required | Roles Allowed | Description |
|---|---|---|---|---|
| `GET` | `/dashboard/summary` | Yes | All | Overview of aggregate balances |
| `GET` | `/dashboard/categories`| Yes | `ANALYST`, `ADMIN` | Detailed breakdown of net records per category |
| `GET` | `/dashboard/trends` | Yes | `ANALYST`, `ADMIN` | Monthly timeline grouping of performance |
| `GET` | `/dashboard/recent` | Yes | All | Latest record inserts (includes identifiers for Analysts/Admins) |

## Role Permissions
| Action | `VIEWER` | `ANALYST` | `ADMIN` |
|---|---|---|---|
| **View own records/stats** | ✅ Yes | ✅ Yes | ✅ Yes |
| **View all users records/stats**| ❌ No | ✅ Yes | ✅ Yes |
| **Create or Edit Records** | ❌ No | ✅ Yes | ✅ Yes |
| **Delete Records** | ❌ No | ❌ No | ✅ Yes |
| **Manage user accounts/roles** | ❌ No | ❌ No | ✅ Yes |

## Data Models
1. **User**: Represents individuals accessing the system.
   - `id`: Unique UUID identifier.
   - `email`: Enforced unique login.
   - `role`: Enum dictating Access Control (`VIEWER`, `ANALYST`, `ADMIN`).
   - `status`: Enum representing if the User object is active or temporarily deactivated.
2. **FinancialRecord**: Financial interactions or transactions matching a user.
   - `id`: Unique UUID identifier.
   - `amount`: Float storing volume.
   - `type`: Enum `INCOME` or `EXPENSE`.
   - `userId`: Foreign key relating back to the owner object in `User`.
   - `isDeleted`: Boolean dictating hard-deletion alternatives for auditing.

## Assumptions Made
1. **Auditing Priority**: Deleting records via the `DELETE /records/:id` endpoint only soft-deletes the field (`isDeleted: true`) rather than performing a database drop, to ensure permanent log trails exist for Admins auditing database tables natively.
2. **Global Viewers**: `VIEWER` roles using endpoints like `GET /records` or `GET /dashboard/summary` do not throw errors; the SQL/Prisma where-clauses autonomously restrict return objects exclusively to `record.userId == req.user.id`.
3. **Stateless Scale**: JWT is favored strictly over session-storage cookies, ensuring the backend logic is inherently stateless.
4. **Analyst Limitations**: A user marked as an `ANALYST` does not require capabilities to `DELETE` records, as deletions modify long-term audit histories reserved to `ADMIN`.
5. **No Password Update Route**: Since account update routes are restricted to `ADMIN` updating roles and states, self-service password updates are out of scope for the current feature set.

## Tradeoffs
1. **PostgreSQL Over SQLite**: Instead of simple prototyping with SQLite, the project opts for heavier relational models inside PostgreSQL using Prisma as it natively handles the complex analytical aggregates required for querying dashboard endpoints cleanly.
2. **Prisma groupBy Over raw native SQL**: In service routes (excluding Month aggregations), Prisma's `.groupBy()` is utilized. While native querying can be more optimized and concise across deep joins, leveraging Prisma allows for end-to-end typing inside TypeScript without manually bridging raw data vectors and maintaining query stability across database migrations.

## Sample Requests

### 1. Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@doe.com", "password": "password123", "role": "ANALYST"}'
```

### 2. Dashboard Summary
```bash
curl -X GET http://localhost:3000/dashboard/summary \
  -H "Authorization: Bearer <inserted_jwt_token>"
```

### 3. Create Record
```bash
curl -X POST http://localhost:3000/records \
  -H "Authorization: Bearer <inserted_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 550, "type": "EXPENSE", "category": "Transport", "date": "2024-03-10T14:30:00Z"}'
```
