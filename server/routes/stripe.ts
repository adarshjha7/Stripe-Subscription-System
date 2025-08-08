import { RequestHandler } from "express";
import Stripe from 'stripe';
import { createSubscription, updateSubscription, getSubscriptionByEmail, getSubscriptionByCustomerId } from '../db';

const getStripeInstance = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }
  return new Stripe(apiKey, {
    apiVersion: '2024-12-18.acacia',
  });
};

const PLAN_PRICE_IDS = {
  Basic: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
  Pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
  Enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
};

export const createCheckoutSession: RequestHandler = async (req, res) => {
  try {
    const { email, plan } = req.body;

    if (!email || !plan) {
      return res.status(400).json({ error: 'Email and plan are required' });
    }

    if (!['Basic', 'Pro', 'Enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const priceId = PLAN_PRICE_IDS[plan as keyof typeof PLAN_PRICE_IDS];

    // Create or update subscription record (skip if database unavailable)
    try {
      let existingSubscription = await getSubscriptionByEmail(email);
      if (!existingSubscription) {
        await createSubscription({
          email,
          plan_name: plan,
          subscription_status: 'incomplete',
        });
      }
    } catch (dbError) {
      console.warn('Database operation failed (continuing without DB):', (dbError as Error).message);
    }

    // Create Stripe checkout session
    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/`,
      customer_email: email,
      metadata: {
        email,
        plan,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const handleWebhook: RequestHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;

  try {
    const stripe = getStripeInstance();
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription') {
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;
          const email = session.metadata?.email || session.customer_email;
          const plan = session.metadata?.plan;

          if (email && plan) {
            await updateSubscription(email, {
              stripe_customer_id: customerId,
              subscription_id: subscriptionId,
              subscription_status: 'active',
            });
          }
        }
        break;

      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const customerId = invoice.customer as string;
          const subscription = await getSubscriptionByCustomerId(customerId);
          
          if (subscription) {
            await updateSubscription(subscription.email, {
              subscription_status: 'active',
            });
          }
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        const customer = await getSubscriptionByCustomerId(updatedSubscription.customer as string);
        
        if (customer) {
          await updateSubscription(customer.email, {
            subscription_status: updatedSubscription.status as any,
          });
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const deletedCustomer = await getSubscriptionByCustomerId(deletedSubscription.customer as string);
        
        if (deletedCustomer) {
          await updateSubscription(deletedCustomer.email, {
            subscription_status: 'canceled',
          });
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const getSubscriptionStatus: RequestHandler = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const subscription = await getSubscriptionByEmail(email);

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({
      email: subscription.email,
      status: subscription.subscription_status,
      plan: subscription.plan_name,
      created_at: subscription.created_at,
      updated_at: subscription.updated_at,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
};
