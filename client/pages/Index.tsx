import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Building } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: '$9',
    period: '/month',
    description: 'Perfect for individuals getting started',
    features: ['Up to 5 projects', 'Basic support', '1GB storage', 'Community access'],
    icon: Zap,
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Best for growing teams and businesses',
    features: ['Unlimited projects', 'Priority support', '50GB storage', 'Advanced analytics', 'Team collaboration'],
    icon: Crown,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large organizations with custom needs',
    features: ['Everything in Pro', 'Custom integrations', 'Unlimited storage', '24/7 phone support', 'SLA guarantee'],
    icon: Building,
    popular: false,
  },
];

export default function Index() {
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !selectedPlan) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-xl dark:bg-slate-950/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              StreamFlow
            </h1>
            <Badge variant="secondary" className="px-3 py-1">
              Secure with Stripe
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Choose Your Perfect Plan
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Unlock powerful features with our flexible subscription plans. Start your journey today with a plan that grows with you.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card key={plan.name} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium py-2">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    <div className="flex items-baseline justify-center mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-slate-500 ml-1">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-left">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Subscription Form */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Get Started Today</CardTitle>
              <CardDescription>Enter your details to begin your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.name} value={plan.name}>
                          {plan.name} - {plan.price}{plan.period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isLoading ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-xl dark:bg-slate-950/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Secure payments powered by Stripe. Test mode - no real charges will be made.
          </p>
        </div>
      </footer>
    </div>
  );
}
