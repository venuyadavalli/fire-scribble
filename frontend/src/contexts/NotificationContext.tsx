import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { notificationsAPI } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  actorUsername: string;
  actorId: string;
  postId?: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  refreshNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  notifications: [],
  refreshNotifications: async () => {},
  markAllAsRead: async () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const getNotificationMessage = (notification: Notification): string => {
    switch (notification.type) {
      case 'LIKE':
        return `@${notification.actorUsername} liked your post`;
      case 'UNLIKE':
        return `@${notification.actorUsername} unliked your post`;
      case 'FOLLOW':
        return `@${notification.actorUsername} started following you`;
      case 'UNFOLLOW':
        return `@${notification.actorUsername} unfollowed you`;
      case 'NEW_POST':
        return `@${notification.actorUsername} created a new post`;
      default:
        return 'New notification';
    }
  };

  const refreshNotifications = async () => {
    if (!user) return;
    
    try {
      const [allNotifications, count] = await Promise.all([
        notificationsAPI.getAll(),
        notificationsAPI.getUnreadCount(),
      ]);
      setNotifications(allNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsConnected(false);
      return;
    }

    // Load initial notifications
    refreshNotifications();

    // Connect to SSE
    let abortController = new AbortController();

    const connectSSE = async () => {
      try {
        const token = await user.getIdToken();
        
        await fetchEventSource('http://localhost:8081/notifications/stream', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: abortController.signal,
          async onopen(response) {
            if (response.ok) {
              setIsConnected(true);
              console.log('SSE connection established');
            } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
              throw new Error('Client error - will not retry');
            }
          },
          onmessage(event) {
            try {
              const notification = JSON.parse(event.data);
              
              // Add to notifications list
              setNotifications((prev) => [notification, ...prev]);
              
              // Increment unread count
              setUnreadCount((prev) => prev + 1);
              
              // Show toast
              toast.info(getNotificationMessage(notification));
            } catch (error) {
              console.error('Error parsing notification:', error);
            }
          },
          onerror(err) {
            console.error('SSE error:', err);
            setIsConnected(false);
            throw err; // Will trigger retry
          },
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to connect to notifications SSE:', error);
          setIsConnected(false);
        }
      }
    };

    connectSSE();

    return () => {
      abortController.abort();
      setIsConnected(false);
    };
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        refreshNotifications,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
