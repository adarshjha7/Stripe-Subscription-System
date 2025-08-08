import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, CreditCard, Calendar, AlertCircle } from 'lucide-react';

interface SubscriptionStatus {
  email: string;
  status: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [email, setEmail] = useState('');
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/subscription-status/${encodeURIComponent(email)}`);
      const data = await response.json();

      if (response.ok) {
        setSubscription(data);
      } else {
        setError(data.error || 'Subscription not found');
        setSubscription(null);
      }
    } catch (err) {
      setError('Failed to fetch subscription status');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'canceled': return 'bg-red-500';
      case 'incomplete': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-xl dark:bg-slate-950/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              StreamFlow Dashboard
            </h1>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Check Subscription Status</CardTitle>
              <CardDescription>
                Enter your email address to view your current subscription details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={checkSubscription} className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Checking...' : 'Check Status'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Card className="mb-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {subscription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Subscription Details</span>
                  <Badge className={`${getStatusColor(subscription.status)} text-white`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-slate-600 dark:text-slate-400">{subscription.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">Plan</p>
                      <p className="text-slate-600 dark:text-slate-400">{subscription.plan}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">Subscription Started</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {formatDate(subscription.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {formatDate(subscription.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {subscription.status === 'active' && (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      🎉 Your subscription is active! You have full access to all {subscription.plan} plan features.
                    </p>
                  </div>
                )}

                {subscription.status === 'canceled' && (
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      Your subscription has been canceled. You can resubscribe at any time.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
