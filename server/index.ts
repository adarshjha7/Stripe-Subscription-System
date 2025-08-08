import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { createCheckoutSession, handleWebhook, getSubscriptionStatus } from "./routes/stripe";
import { initializeDatabase } from "./db";

export function createServer() {
  const app = express();

  // Initialize database (optional for development)
  initializeDatabase().catch((error) => {
    console.warn('Database initialization failed (this is okay for development):', error.message);
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Stripe routes
  app.post("/api/create-checkout-session", createCheckoutSession);
  app.get("/api/subscription-status/:email", getSubscriptionStatus);

  // Webhook endpoint needs raw body - define after JSON middleware
  app.post('/api/webhook', express.raw({ type: 'application/json' }), handleWebhook);

  return app;
}
