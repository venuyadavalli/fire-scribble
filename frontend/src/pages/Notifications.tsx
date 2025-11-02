import { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Bell } from 'lucide-react';
import { createSSEConnection } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  username?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Connect to SSE endpoint for real-time notifications
    const connectSSE = async () => {
      try {
        const eventSource = await createSSEConnection('/sse/notifications', (data) => {
          const newNotification: Notification = {
            id: Date.now().toString(),
            type: data.type,
            message: getNotificationMessage(data),
            timestamp: new Date().toISOString(),
            username: data.username,
          };
          setNotifications((prev) => [newNotification, ...prev]);
        });
        eventSourceRef.current = eventSource;
      } catch (error) {
        console.error('Failed to connect to notifications SSE:', error);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const getNotificationMessage = (data: any): string => {
    switch (data.type) {
      case 'LIKE':
        return `${data.username} liked your post`;
      case 'FOLLOW':
        return `${data.username} started following you`;
      case 'NEW_POST':
        return `${data.username} created a new post`;
      default:
        return 'New notification';
    }
  };

  return (
    <Layout>
      <div className="border-x border-border min-h-screen">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="p-4 text-xl font-bold">Notifications</h1>
        </div>

        <div className="divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground">
                You'll see notifications here when someone interacts with your posts
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="p-4">
                <p>{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
