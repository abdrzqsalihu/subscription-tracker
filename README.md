# 📦 Subscription Management API

This is a RESTful API for managing user subscriptions, including features like user authentication, subscription CRUD operations, bot protection with Arcjet, and automated email reminders for upcoming renewals using Upstash Workflows

## 🚀 Features

- User registration and login with JWT
- Admin and user role-based access
- Full CRUD for subscriptions
- Auto email reminders before renewal (7, 5, 2, and 1 day)
- MongoDB with Mongoose
- Upstash Workflow integration
- Arcjet bot protection

## 🛠️ Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** for authentication
- **Upstash Workflows** for reminders

## 🔧 Setup & Configuration

Clone the repository and install dependencies:

```bash
git clone https://github.com/abdrzqsalihu/subscription-tracker.git
cd subscription-tracker
npm install
```

Create a .env file in the root directory with this content:

```env
NODE_ENV='development'
PORT=5000
DB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
EMAIL_FROM=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
SERVER_URL=http://localhost:5000

# Arcjet Bot Protection
ARCJET_ENV=development
ARCJET_KEY=your_arcjet_api_key

# Upstash QStash
QSTASH_URL=http://127.0.0.1:8080
QSTASH_TOKEN=your_qstash_token
```

To start the development server:

```bash
npm run dev
```

The API will now be running at http://localhost:5000/api/v1

## 🛣️ API Endpoints

Auth:
- POST /auth/signup - Register a new user
- POST /auth/signin - Login and get token

Users:
- GET /users - Get all users (admin only)
- GET /users/:id - Get single user (admin or self)
- PUT /users/:id - Update user (admin or self)
- DELETE /users/:id - Delete user (admin or self)

Subscriptions:
- GET /subscriptions - All subscriptions (admin only)
- GET /subscriptions/:id - Get single subscription (admin or owner)
- POST /subscriptions - Create a subscription
- PUT /subscriptions/:id - Update subscription
- DELETE /subscriptions/:id - Delete subscription
- POST /subscriptions/:id/cancel - Cancel subscription
- GET /subscriptions/upcoming - Get upcoming renewals
- GET /users/:id/subscriptions - Get user’s subscriptions

## 📬 Email Reminders

Reminders are automatically scheduled via Upstash Workflows to email the user 7, 5, 2, and 1 day before their subscription renewal date.

## 🛡️ Arcjet Protection

Arcjet is integrated for bot protection and abuse prevention on critical routes.

## 📁 Folder Structure

```
.
├── config/             # Environment config, DB connection
├── controllers/        # All route logic
├── database/           # Database configuration and connection
├── middleware/         # Middlewares
├── models/             # Mongoose schemas
├── routes/             # API routes
├── utils/              # Helper functions
├── workflows/          # Upstash reminder logic
├── app.js              # Entry point
├── .env                # Environment variables (add manually)
```

## 📄 License

MIT License © 2025 [Abdulrazaq Salihu]
