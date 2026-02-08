# Authentication Setup Complete! 🎉

## What Changed:

### Backend (mad market backend):
1. ✅ **JWT Authentication** - Users get a token that lasts 7 days
2. ✅ **Protected Routes** - Middleware to verify tokens
3. ✅ **Token Generation** - Automatic token creation on login/register
4. ✅ **User Verification** - `/api/auth/me` endpoint to check if user is still logged in

### Frontend (mad):
1. ✅ **Persistent Login** - Users stay logged in until manual logout (using localStorage)
2. ✅ **Auto-login** - App checks for existing token on load
3. ✅ **Token Storage** - Saves JWT token and user data in localStorage
4. ✅ **OTP Mock** - OTP screen still shows but is mock only
5. ✅ **Removed Role Selection** - No more buyer/seller selection during signup
6. ✅ **API Proxy** - Vite proxies `/api` requests to backend

## How to Run:

### 1. Start Backend:
```bash
cd "e:\web\mad market backend"
npm install  # if not done already
npm run dev
```
Backend will run on: `http://localhost:5000`

### 2. Start Frontend:
```bash
cd "e:\download\mad"
npm install  # if not done already
npm run dev
```
Frontend will run on: `http://localhost:3000`

## How It Works:

### Registration Flow:
1. User fills registration form
2. Mock OTP screen appears
3. On "Verify", JWT token is saved to localStorage
4. User is logged in

### Login Flow:
1. User enters email/phone + password
2. Mock OTP screen appears
3. On "Verify", JWT token is saved to localStorage
4. User is logged in

### Auto-Login:
- When user opens the app, it checks localStorage for token
- If token exists and is valid, user is automatically logged in
- If token expired or invalid, user must login again

### Logout:
- Clears token and user data from localStorage
- User must login again

## API Endpoints:

- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/me` - Verify token (requires Authorization header)

## Token Usage (for other API calls):

```javascript
const token = localStorage.getItem('token');

fetch('/api/your-endpoint', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Environment Variables:

Make sure your `.env` file in backend has:
- `JWT_SECRET` - Your secret key for tokens
- `JWT_EXPIRE` - Token expiration (default: 7d)
- `MONGODB_URI` - Your MongoDB connection string

---

**Note**: OTP is still mock. Users just click "Verify & Continue" and they're logged in. No real SMS/email OTP is sent.
