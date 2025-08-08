import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, CreditCard, Mail } from 'lucide-react';

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      setTimeout(() => setIsLoading(false), 1000);
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-500">Invalid Session</CardTitle>
            <CardDescription>No checkout session found</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              Payment Successful
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              {isLoading ? 'Processing...' : 'Subscription Successful!'}
            </CardTitle>
            <CardDescription className="text-base">
              {isLoading 
                ? 'We\'re confirming your payment...' 
                : 'Welcome to StreamFlow! Your subscription is now active.'
              }
            </CardDescription>
          </CardHeader>
          
          {!isLoading && (
            <CardContent className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span>Session ID: {sessionId}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Confirmation email sent to your inbox</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">What happens next?</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                    You'll receive a confirmation email with your subscription details
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                    Your account will be activated within the next few minutes
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                    You can start using all premium features immediately
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Link to="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back Home
                  </Button>
                </Link>
                <Link to="/dashboard" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
