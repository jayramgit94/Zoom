# 🚀 PRODUCTION DEPLOYMENT GUIDE

## **CRITICAL: Environment Variables Setup on Render**

### **⚠️ The Root Cause of All Errors**

Your `.env` file is a **local development file only**. Render doesn't load it. You MUST set environment variables in Render dashboard.

```
❌ WRONG: Relying on .env file in Git
✅ RIGHT: Set environment variables in Render dashboard
```

---

## **STEP 1: Remove `.env` from Git (Security)**

```bash
# If .env was already committed (⚠️ credentials exposed):
git rm --cached backend/.env
echo ".env" >> backend/.gitignore
git add backend/.gitignore
git commit -m "fix: remove .env from git (security)"
git push origin main

# ⚠️ THEN REGENERATE YOUR MONGODB PASSWORD!
# Your password was exposed in Git history
```

---

## **STEP 2: Set Environment Variables in Render**

### **A. Go to Render Dashboard**
```
1. https://render.com/dashboard
2. Select your backend service (zoom-backend)
3. Go to: Settings → Environment
```

### **B. Add These Variables**

| Variable | Value | Example |
|----------|-------|---------|
| `PORT` | `8001` | `8001` |
| `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://jayram:PASSWORD@zoomcall.xxtgtjm.mongodb.net/zoomCall?retryWrites=true&w=majority` |
| `MONGO_USER` | Your MongoDB username | `jayram` |
| `NODE_ENV` | `production` | `production` |
| `FRONTEND_URL` | Your Vercel frontend URL | `https://zoom-xepv-git-main-jayram-s-projects.vercel.app` |

### **C. Get Your MongoDB URI**

```
1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Click "Clusters" → "Connect"
3. Choose "Drivers" → "Node.js"
4. Copy the connection string
5. Replace:
   - <password> with your password
   - <database> with your database name (zoomCall)
6. Add ?retryWrites=true&w=majority to end
```

### **D. Click "Save"**

Changes take effect immediately or on next deploy.

---

## **STEP 3: Deploy and Verify**

### **Redeploy Backend on Render**
```
1. Render dashboard → Your service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to finish
4. Check logs for "✅ MongoDB connected successfully"
```

### **Test Health Endpoint**
```bash
curl https://zoom-zako.onrender.com/health

Expected Response:
{
  "status": "ok",
  "database": "connected",
  "mongoUriConfigured": true,
  "environment": "production",
  "timestamp": "2026-01-19T..."
}
```

### **If Database Shows "disconnected"**
```
1. Wait 10-15 seconds (Render cold start)
2. Try /health again
3. Check Render service logs for errors:
   - "MongoDB connection error"
   - "MONGODB_URI is undefined"
   - Network connectivity issues
```

---

## **STEP 4: Handle Render Free Tier Cold Starts**

### **What's Happening**
- Render free tier spins down after 15 minutes of inactivity
- First request after inactivity takes 30-50 seconds
- During cold start, MongoDB connection may timeout

### **What We Fixed**
✅ Server starts immediately (doesn't wait for DB)
✅ Retries database connection every 5 seconds (up to 10 times)
✅ Requests to `/api/*` return 503 if DB not ready (graceful failure)
✅ Health endpoint shows real-time connection status

### **For Users**
- First request after cold start: May wait 10-30 seconds
- Subsequent requests: Fast (<100ms)
- Connections keep DB warm for 15 minutes

---

## **STEP 5: Fix Frontend (Vercel)**

### **Environment Variable in Vercel**

```
1. Vercel dashboard → Your project
2. Settings → Environment Variables
3. Add or update:
   - Name: VITE_BACKEND_URL
   - Value: https://zoom-zako.onrender.com
4. Click "Save"
5. Go to Deployments → Redeploy latest
```

### **What Changed**
```
❌ OLD: vercel.json had hardcoded API proxy (broken)
✅ NEW: vercel.json only handles SPA routing
✅ Frontend uses VITE_BACKEND_URL environment variable
```

---

## **VERIFICATION CHECKLIST**

- [ ] `.env` removed from Git history (or password regenerated)
- [ ] Environment variables set in Render dashboard
- [ ] Backend redeployed after env changes
- [ ] Health endpoint returns "database": "connected"
- [ ] Registration works (POST /api/v1/user/register)
- [ ] Login works (POST /api/v1/user/login)
- [ ] Room links load without 404 (SPA routing)
- [ ] Mobile can access room links
- [ ] No errors in Render logs

---

## **TROUBLESHOOTING**

### **❌ "MongoDB connection error: The `uri` parameter must be a string"**

**Cause**: `MONGODB_URI` not set in Render

**Fix**:
1. Go to Render → Settings → Environment
2. Add `MONGODB_URI` variable
3. Redeploy
4. Wait 10-15 seconds for cold start
5. Test `/health` endpoint

### **❌ MongoDB still showing "disconnected"**

**Check**:
1. Is `MONGODB_URI` variable set in Render? (Case-sensitive!)
2. Is connection string correct? Test locally first
3. Does MongoDB Atlas IP whitelist include 0.0.0.0/0?
4. Is your MongoDB user/password correct?
5. Check Render logs for exact error message

**Test connection locally**:
```bash
# In backend directory
npm install
NODE_ENV=production MONGODB_URI="your_uri_here" npm start
```

### **❌ Registration fails with 503**

**Cause**: Database not ready (cold start or connection failed)

**What user sees**: "Error: Service Unavailable"

**Fix**:
1. Wait 30 seconds (cold start)
2. Retry registration
3. If still fails, check `/health` endpoint
4. Check Render logs for DB errors

### **❌ Vercel still returning 404**

**Cause**: SPA routing not working

**Fix**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check `frontend/vercel.json` exists
4. Vercel may need manual redeploy:
   - Deployments → Click latest → "Redeploy"

---

## **PRODUCTION CHECKLIST**

Before declaring "ready for production":

### **Security**
- [ ] `.env` file removed from Git
- [ ] MongoDB password regenerated (was exposed)
- [ ] CORS allows only your frontend URL
- [ ] No credentials in logs or error messages

### **Functionality**
- [ ] Registration works end-to-end
- [ ] Login returns valid token
- [ ] Room links work on desktop and mobile
- [ ] WebRTC video call initiates
- [ ] Socket.io connections work

### **Reliability**
- [ ] Health endpoint responds correctly
- [ ] Cold start handled gracefully
- [ ] Error messages are helpful
- [ ] Logs show clear connection status

### **Performance**
- [ ] First request after cold start: <30 sec
- [ ] Normal requests: <500 ms
- [ ] Database queries: <2 sec
- [ ] No connection timeout errors

---

## **FILES CHANGED**

### **Backend**
- ✅ `src/app.js` - Added env validation, better retry logic, enhanced health endpoint
- ✅ `src/controllers/user.controller.js` - Query timeouts, connection checks
- ✅ `src/routes/users.routes.js` - DB health middleware
- ✅ `.env.example` - Template for environment variables
- ✅ `.gitignore` - Ensure `.env` is ignored

### **Frontend**
- ✅ `vercel.json` - Removed hardcoded API proxy, SPA routing only
- ✅ `src/environment.js` - Uses `VITE_BACKEND_URL` environment variable

---

## **NEXT STEPS**

1. **Remove `.env` from Git** (if not already done)
2. **Set Render environment variables** (CRITICAL!)
3. **Redeploy both frontend and backend**
4. **Test health endpoint**
5. **Test registration flow**
6. **Test room links on mobile**

All issues should be resolved after these steps! 🚀
