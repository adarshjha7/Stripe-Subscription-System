# StreamFlow - Subscription Management System

A Full-Stack subscription system built with React, Express, Stripe, and SQLite. Features an application for subscription plans with secure payment processing.

## 🚀 Features

* **Modern React Frontend** with TypeScript and Tailwind CSS
* **Express.js Backend** with Stripe integration
* **Secure Payment Processing** via Stripe Checkout
* **Real-time Webhook Processing** for subscription events
* **SQLite Database** for subscription tracking
* **Beautiful UI** with responsive design and shadcn/ui components
* **Complete Subscription Flow** from signup to payment confirmation

## 📋 Prerequisites

Before running this application, ensure you have:

* **Node.js** (v18 or higher)
* **npm** or **yarn**
* **SQLite** installed (or use the in-project DB file)
* **Stripe Account** (for payment processing)
* **ngrok** (for webhook testing in development)

**Note:** While the initial prototype was built using MySQL, SQLite has been used in the current implementation due to its lightweight nature and similar querying style to MySQL.

## 🛠️ Quick Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd subscription-system
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your secrets:

```bash
cp .env.example .env
```

Edit `.env` with your actual values (see Environment Variables section below).

### 3. Database Setup

On first run, SQLite will auto-create the database file (`subscription.db`) and tables if not present.

### 4. Stripe Configuration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test API keys from the Stripe Dashboard
3. Create product and price objects for your subscription plans
4. Set up a webhook endpoint (see Webhook Setup section)

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 🔧 Environment Variables

Configure these variables in your `.env` file:

### Stripe Configuration (Required)

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_BASIC_PRICE_ID=price_your_basic_plan_price_id
STRIPE_PRO_PRICE_ID=price_your_pro_plan_price_id
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_plan_price_id
```

### Application Configuration (Optional)

```env
FRONTEND_URL=http://localhost:8080
```

## 🗄️ Database Schema (SQLite)

The application uses a simple SQLite schema:

```sql
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  plan_name TEXT CHECK(plan_name IN ('Basic', 'Pro', 'Enterprise')) NOT NULL,
  subscription_id TEXT,
  subscription_status TEXT CHECK(subscription_status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')) DEFAULT 'incomplete',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

> Timestamps are automatically updated using triggers in SQLite.

## 🔗 Stripe Setup Guide

### 1. Create Products and Prices

In your Stripe Dashboard:

1. Go to **Products** → **Add Product**
2. Create three products: "Basic", "Pro", "Enterprise"
3. For each product, create a recurring price
4. Copy the `price_xxx` IDs to your `.env` file

### 2. Webhook Configuration

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://your-domain.com/api/webhook` (use ngrok for local development)
3. Select these events:

   * `checkout.session.completed`
   * `invoice.paid`
   * `customer.subscription.updated`
   * `customer.subscription.deleted`
4. Copy the webhook signing secret to your `.env` file

### 3. Local Development with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 8080

# Use the ngrok HTTPS URL for your Stripe webhook endpoint
# Example: https://abc123.ngrok.io/api/webhook
```

## 🚀 API Endpoints

### Subscription Management

* `POST /api/create-checkout-session` – Create Stripe checkout session
* `GET /api/subscription-status/:email` – Get subscription details
* `POST /api/webhook` – Handle Stripe webhooks

### Health Check

* `GET /api/ping` – Server health check

## 📱 Frontend Routes

* `/` – Main subscription page with pricing plans
* `/success` – Payment success confirmation
* `/dashboard` – Subscription status checker

## 🧪 Testing

Run tests with:

```bash
npm test
```

Build for production:

```bash
npm run build
npm start
```

## 🔒 Security Notes

* Never commit real API keys to version control
* Use Stripe's test mode during development
* Validate webhook signatures for security
* Implement proper error handling and logging
* Use HTTPS in production

## 📝 Usage Flow

1. **User visits homepage** → Sees pricing plans
2. **User selects plan** → Enters email and chooses plan
3. **User clicks Subscribe** → Redirected to Stripe Checkout
4. **User completes payment** → Redirected to success page
5. **Webhook processes event** → Updates database with subscription status
6. **User can check status** → Via dashboard page with email lookup
