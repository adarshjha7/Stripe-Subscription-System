import sqlite3 from 'sqlite3';
import { open } from 'sqlite';  // This package makes sqlite3 async/Promise-friendly

// Open DB connection function
export const openDb = async () => {
  return open({
    filename: './subscription_db.sqlite',
    driver: sqlite3.Database
  });
};

// Initialize DB and create the table if not exists
export const initializeDatabase = async () => {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      stripe_customer_id TEXT,
      plan_name TEXT CHECK(plan_name IN ('Basic', 'Pro', 'Enterprise')) NOT NULL,
      subscription_id TEXT,
      subscription_status TEXT CHECK(subscription_status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')) DEFAULT 'incomplete',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('SQLite database initialized');
};

// TypeScript interface can remain the same
export interface Subscription {
  id?: number;
  email: string;
  stripe_customer_id?: string;
  plan_name: 'Basic' | 'Pro' | 'Enterprise';
  subscription_id?: string;
  subscription_status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  created_at?: Date;
  updated_at?: Date;
}

// Insert new subscription
export const createSubscription = async (subscription: Subscription) => {
  const db = await openDb();
  const result = await db.run(`
    INSERT INTO subscriptions (email, stripe_customer_id, plan_name, subscription_id, subscription_status) 
    VALUES (?, ?, ?, ?, ?)
  `,
  subscription.email, subscription.stripe_customer_id, subscription.plan_name, subscription.subscription_id, subscription.subscription_status);

  return result;
};

// Update subscription by email
export const updateSubscription = async (email: string, updates: Partial<Subscription>) => {
  const db = await openDb();

  const fields = Object.keys(updates);
  if (fields.length === 0) return;

  const setClause = fields.map(key => `${key} = ?`).join(', ');
  const values = fields.map(key => (updates as any)[key]);
  values.push(email);

  const result = await db.run(
    `UPDATE subscriptions SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE email = ?`,
    ...values
  );

  return result;
};

// Get subscription by email
export const getSubscriptionByEmail = async (email: string): Promise<Subscription | null> => {
  const db = await openDb();
  const subscription = await db.get('SELECT * FROM subscriptions WHERE email = ?', email);
  return subscription || null;
};

// Get subscription by Stripe customer id
export const getSubscriptionByCustomerId = async (customerId: string): Promise<Subscription | null> => {
  const db = await openDb();
  const subscription = await db.get('SELECT * FROM subscriptions WHERE stripe_customer_id = ?', customerId);
  return subscription || null;
};
