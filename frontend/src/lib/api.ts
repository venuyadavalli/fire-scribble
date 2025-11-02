import { auth } from './firebase';

const API_BASE_URL = 'http://localhost:8081';

async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getCurrentUser: () => fetchWithAuth('/auth/me'),
};

// Users API
export const usersAPI = {
  getProfile: (username: string) => fetchWithAuth(`/users/info/${username}`),
  searchUsers: (query: string) => fetchWithAuth(`/users/search/${query}`),
};

// Posts API
export const postsAPI = {
  createPost: (content: string) =>
    fetchWithAuth('/posts', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  
  getUserPosts: (username: string) => fetchWithAuth(`/posts/${username}`),
  
  deletePost: (postId: string) =>
    fetchWithAuth(`/posts/${postId}`, { method: 'DELETE' }),
};

// Feed API
export const feedAPI = {
  getPublicFeed: (page = 0, size = 10) =>
    fetchWithAuth(`/feed/public?page=${page}&size=${size}`),
  
  getFollowingFeed: (page = 0, size = 10) =>
    fetchWithAuth(`/feed/following?page=${page}&size=${size}`),
};

// Follows API
export const followsAPI = {
  followUser: (userId: string) =>
    fetchWithAuth(`/follows/${userId}`, { method: 'POST' }),
  
  unfollowUser: (userId: string) =>
    fetchWithAuth(`/follows/${userId}`, { method: 'DELETE' }),
  
  getFollowers: (userId: string) => fetchWithAuth(`/follows/followers/${userId}`),
  
  getFollowing: (userId: string) => fetchWithAuth(`/follows/followees/${userId}`),
};

// Likes API
export const likesAPI = {
  likePost: (postId: string) =>
    fetchWithAuth(`/likes/${postId}`, { method: 'POST' }),
  
  unlikePost: (postId: string) =>
    fetchWithAuth(`/likes/${postId}`, { method: 'DELETE' }),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => fetchWithAuth('/notifications'),
  
  getUnread: () => fetchWithAuth('/notifications/unread'),
  
  getUnreadCount: () => fetchWithAuth('/notifications/unread/count'),
  
  markAsRead: (notificationId: string) =>
    fetchWithAuth(`/notifications/${notificationId}/read`, { method: 'POST' }),
  
  markAllAsRead: () =>
    fetchWithAuth('/notifications/read-all', { method: 'POST' }),
};

// SSE for real-time updates
export function createSSEConnection(endpoint: string, onMessage: (data: any) => void) {
  const token = auth.currentUser?.getIdToken();
  
  return token.then((token) => {
    const eventSource = new EventSource(
      `${API_BASE_URL}${endpoint}?token=${token}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.addEventListener('notification', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing notification SSE message:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    return eventSource;
  });
}
