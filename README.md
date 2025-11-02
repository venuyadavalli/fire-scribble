# Microblog - Full-Stack Social Media Platform

A modern, real-time microblogging platform built with Spring Boot backend and React frontend, featuring user authentication, posts, follows, likes, and real-time notifications.

## 🎯 Overview

Microblog is a Twitter-like social media application that allows users to:
- Create and share short posts (up to 280 characters)
- Follow and unfollow other users
- Like and unlike posts
- View personalized feeds (public and following)
- Receive real-time notifications for interactions
- Search for users
- View user profiles with posts, followers, and following lists

## 🏗️ Architecture

### Backend (Spring Boot)
- **Framework**: Spring Boot 2.7.x
- **Authentication**: Firebase Authentication with JWT tokens
- **Database**: JPA/Hibernate with H2 (development) / PostgreSQL (production ready)
- **Real-time**: Server-Sent Events (SSE) for notifications
- **API Style**: RESTful JSON API

### Frontend (React + Vite)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API
- **Authentication**: Firebase SDK
- **Real-time**: EventSource API for SSE

## 🚀 Features

### User Authentication
- Email/password registration and login via Firebase
- JWT token-based API authentication
- Protected routes and authorization
- Password reset functionality

### Posts
- Create posts (280 character limit)
- View user posts on profile pages
- Delete own posts
- Real-time feed updates

### Social Features
- Follow/unfollow users
- Like/unlike posts
- View followers and following lists
- User search functionality

### Feeds
- **Public Feed**: All posts from all users with pagination
- **Following Feed**: Posts only from followed users
- Infinite scrolling with real-time updates

### Notifications
- Real-time notifications via SSE for:
  - New follows/unfollows
  - Likes/unlikes on your posts
  - New posts from followed users
- Mark notifications as read
- Unread notification count

## 📋 Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- Firebase project with Authentication enabled
- Maven (for backend)
- npm/yarn/bun (for frontend)

## 🔧 Installation & Setup

### 1. Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Email/Password authentication in Firebase Console
3. Download service account JSON from Project Settings → Service Accounts
4. Save as `serviceAccountKey.json` in backend root directory

### 2. Backend Setup

```bash
cd backend

# Set Firebase config path
export FIREBASE_CONFIG_PATH=./serviceAccountKey.json

# Build and run
./gradlew bootRun
```

Backend will start on `http://localhost:8081`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Update Firebase configuration in src/lib/firebase.ts with your Firebase project keys:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

# Start development server
npm run dev
```

Frontend will start on `http://localhost:5173`

## 📁 Project Structure

```
microblog/
├── backend/
│   ├── src/main/java/com/microblog/
│   │   ├── config/              # Security, Firebase, CORS config
│   │   ├── controllers/         # REST API endpoints
│   │   ├── demo/                # SSE service
│   │   ├── dto/                 # Data transfer objects
│   │   ├── events/              # Event system
│   │   ├── models/              # JPA entities
│   │   ├── repositories/        # Database repositories
│   │   └── services/            # Business logic
│   └── build.gradle
│
└── frontend/
    ├── src/
    │   ├── components/          # Reusable UI components
    │   ├── contexts/            # React Context (Auth)
    │   ├── lib/                 # API client, Firebase, utils
    │   ├── pages/               # Page components/routes
    │   └── App.tsx              # Root component with routing
    └── package.json
```

## 🔐 API Authentication

All API requests (except registration) require Firebase JWT token:

```
Authorization: Bearer <firebase_jwt_token>
```

The frontend automatically includes this header using Firebase auth state.

## 📡 Key API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user info

### Users
- `GET /users/info/{username}` - Get user profile
- `GET /users/search/{query}` - Search users

### Posts
- `POST /posts` - Create post
- `GET /posts/{username}` - Get user posts
- `DELETE /posts/{id}` - Delete post

### Feed
- `GET /feed/public?page=0&size=10` - Public feed
- `GET /feed/following?page=0&size=10` - Following feed

### Follows
- `POST /follows/{userId}` - Follow user
- `DELETE /follows/{userId}` - Unfollow user
- `GET /follows/followers/{userId}` - Get followers
- `GET /follows/followees/{userId}` - Get following

### Likes
- `POST /likes/{postId}` - Like post
- `DELETE /likes/{postId}` - Unlike post

### Notifications
- `GET /notifications` - Get all notifications
- `GET /notifications/unread` - Get unread notifications
- `GET /notifications/unread/count` - Get unread count
- `POST /notifications/{id}/read` - Mark as read
- `POST /notifications/read-all` - Mark all as read
- `GET /notifications/stream` - SSE stream

## 🎨 Design System

The frontend uses a semantic token-based design system:
- Colors: HSL-based theme tokens defined in `src/index.css`
- Components: shadcn/ui with custom variants
- Styling: Tailwind CSS with custom configuration
- Responsive: Mobile-first responsive design

## 🔄 Real-Time Features

### Server-Sent Events (SSE)
The application uses SSE for real-time updates:
- Feed updates (new posts, likes, deletions)
- Live notifications
- Automatic reconnection on connection loss

## 🧪 Testing

### Backend Tests
```bash
cd backend
./gradlew test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🚢 Deployment

### Backend Deployment
1. Update `application.properties` for production database
2. Set environment variables for Firebase config
3. Build: `./gradlew build`
4. Deploy JAR to your hosting service

### Frontend Deployment
1. Update API base URL in `src/lib/api.ts`
2. Build: `npm run build`
3. Deploy `dist/` folder to hosting service (Vercel, Netlify, etc.)

## 🛠️ Development

### Backend Development
- Hot reload: Use Spring Boot DevTools
- Database: H2 console at `/h2-console` (development)
- Logs: Check console output for SSE and API logs

### Frontend Development
- Hot reload: Vite provides instant HMR
- API proxy: Configured for `http://localhost:8081`
- Dev tools: React DevTools recommended

## 📝 Known Issues & Solutions

### Follow/Unfollow Not Toggling
**Fixed**: Backend now returns 204 No Content instead of 200 OK with empty body, which frontend handles correctly.

### SSE Connection Issues
- Ensure Firebase token is valid and not expired
- Check CORS configuration allows EventSource connections
- Verify backend SSE endpoints are accessible

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Developed as a full-stack microblogging platform demonstration.

## 🙏 Acknowledgments

- Firebase for authentication infrastructure
- Spring Boot for robust backend framework
- React and Vite for modern frontend development
- shadcn/ui for beautiful UI components
- Tailwind CSS for utility-first styling
