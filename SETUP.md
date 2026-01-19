# 🎥 Zoom Clone - Setup & Deployment Guide

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (free tier available)
- Git

---

## 🚀 LOCAL SETUP (Development)

### 1️⃣ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your MongoDB credentials
# Get MongoDB URL from: https://www.mongodb.com/cloud/atlas
```

**Your `.env` should look like:**
```env
PORT=8001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/databasename
MONGO_USER=your_username
NODE_ENV=development
FRONTEND_URL=http://localhost:8000
```

**Start Backend:**
```bash
npm run dev
```
✓ Server should run on `http://localhost:8001`

---

### 2️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# .env.local already points to localhost:8001 ✓
```

**Start Frontend:**
```bash
npm run dev
```
✓ App should run on `http://localhost:8000`

---

## 🧪 Testing on Local Network (Other Devices)

### For Same Network Devices:

**1. Find Your Computer's IP Address:**

**Windows (PowerShell):**
```powershell
ipconfig
# Look for "IPv4 Address" under your active connection (e.g., 192.168.x.x)
```

**2. Update Backend App.js:**
- Change `host: true` ensures it listens on all network interfaces ✓ (already set in Vite config)

**3. On Other Device, use:**
```
http://YOUR_IP_ADDRESS:8000
```

**Example:**
- Your IP: `192.168.1.100`
- Other device: `http://192.168.1.100:8000`

---

## 🌐 DEPLOYMENT (Production)

### Step 1: Deploy Backend to Render.com

1. **Go to** [render.com](https://render.com)
2. **Sign up** with GitHub
3. **Create New → Web Service**
4. **Connect GitHub repo** (jayramgit94/Zoom)
5. **Configure:**
   - Name: `zoom-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm run start`
   - Root Directory: `.` (leave empty)

6. **Add Environment Variables:**
   - `PORT`: `8001`
   - `MONGODB_URI`: `mongodb+srv://username:password@...`
   - `MONGO_USER`: `your_username`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://yourdomain.vercel.app`

7. Click **Create Web Service**
8. Wait for deployment (5-10 minutes)
9. **Note the URL**: `https://zoom-backend-xxxx.onrender.com`

---

### Step 2: Deploy Frontend to Vercel

1. **Go to** [vercel.com](https://vercel.com)
2. **Sign up** with GitHub
3. **Import Project** → Select `jayramgit94/Zoom`
4. **Configure:**
   - Framework: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add Environment Variables:**
   - `VITE_BACKEND_URL`: `https://zoom-backend-xxxx.onrender.com`

6. Click **Deploy**
7. Done! Your app is live! 🎉

---

## ⚙️ Environment Variables Explained

### Backend (.env)
```env
PORT=8001                    # Server port
MONGODB_URI=...             # MongoDB connection string
MONGO_USER=...              # MongoDB username
NODE_ENV=development        # Set to 'production' for production
FRONTEND_URL=...            # For CORS security
```

### Frontend (.env.local or .env.production)
```env
VITE_BACKEND_URL=...        # Backend URL
```

**The app automatically detects:**
- Development mode: Uses `http://localhost:8001`
- Production mode: Uses deployed backend URL

---

## 🔒 Security Checklist

- ✅ Credentials in `.env` (not in code)
- ✅ `.env` added to `.gitignore`
- ✅ Socket.io CORS restricted to known origins
- ✅ MongoDB username/password secured
- ✅ Frontend build optimized (minified, no sourcemaps)

---

## 🐛 Troubleshooting

### "Cannot connect to localhost:8001"
- Check backend is running: `npm run dev` in `/backend`
- Check port is 8001 in `.env`

### "Cannot connect on other devices"
- Use device IP instead of localhost: `http://192.168.x.x:8000`
- Check firewall allows port 8000 and 8001
- Both devices must be on same network

### "MongoDB connection error"
- Verify `MONGODB_URI` in `.env`
- Add your IP to MongoDB IP Whitelist: https://cloud.mongodb.com
- Check internet connection

### "Routes not working"
- Clear browser cache: `Ctrl+Shift+Delete`
- Restart backend and frontend
- Check browser console for errors

---

## 📱 Features Checklist

- ✅ User Authentication (Register/Login)
- ✅ Video Calling with WebRTC
- ✅ Audio Control (Mute/Unmute)
- ✅ Screen Sharing
- ✅ Chat Feature
- ✅ Meeting History
- ✅ Guest Join Option

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Check backend console for errors
3. Verify all `.env` variables are set correctly
4. Ensure MongoDB connection is active

---

## 🎯 Summary

| Step | Command | Status |
|------|---------|--------|
| Backend Install | `cd backend && npm install` | ✓ |
| Frontend Install | `cd frontend && npm install` | ✓ |
| Setup .env files | `cp .env.example .env` | ✓ |
| Local Testing | `npm run dev` (both folders) | ✓ |
| Deploy Backend | Push to Render.com | ✓ |
| Deploy Frontend | Push to Vercel | ✓ |

Happy Coding! 🚀
