# Clinic Token System - Backend

This is the backend server for the Clinic Token Management System.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/clinic-token
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CLIENT_URL=http://localhost:3000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/register

### Tokens
- GET /api/tokens
- POST /api/tokens
- PUT /api/tokens/:id
- DELETE /api/tokens/:id

### Queue
- GET /api/queue/status
- PUT /api/queue/next
- PUT /api/queue/skip/:id
- GET /api/queue/wait-time

## WebSocket Events

The server uses Socket.IO for real-time updates. The following events are emitted:

- `newToken`: When a new token is created
- `tokenUpdate`: When a token is updated
- `tokenDelete`: When a token is deleted
- `queueUpdate`: When the queue status changes

## Development

The server uses nodemon for development, which automatically restarts the server when changes are detected.

To start the development server:
```bash
npm run dev
```

For production:
```bash
npm start
``` 