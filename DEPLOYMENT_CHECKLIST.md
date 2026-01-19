# 🚀 DEPLOYMENT CHECKLIST - DO THIS NOW

## **Step 1: Wait for Auto-Deployments**
- ⏳ **Vercel**: Will redeploy automatically (2-3 minutes)
- ⏳ **Render**: Will redeploy automatically (5-10 minutes)

Monitor at:
- Vercel: https://vercel.com/dashboard/jayramgit94/Zoom
- Render: https://render.com/dashboard

---

## **Step 2: Verify Deployments**

### **A. Check Backend Health** (After Render deploys)
```
GET https://zoom-zako.onrender.com/health

Expected Response:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-01-19T..."
}

If you see "database": "disconnected":
→ MongoDB may need time to connect (Render free tier is slow)
→ Wait 5 more minutes and retry
```

### **B. Check Frontend Builds**
```
Vercel Dashboard:
- Look for "zoom-clone" deployment
- Should show ✅ "Ready" in green

Render Dashboard:
- Look for "zoom-backend" service
- Should show "Live" in green
```

---

## **Step 3: Test Core Functionality**

### **Test 1: Registration** (Most Critical)
```
1. Go to: https://zoom-xepv-git-main-jayram-s-projects.vercel.app
2. Click "Sign Up" or navigate to /auth
3. Fill in: Name, Username, Password
4. Click "Register"

Expected: ✅ "User Registered" message (NOT "Something went wrong")

If it fails:
→ Check browser DevTools Network tab
→ Look for POST to /api/v1/user/register
→ Check response status and error message
→ See TROUBLESHOOTING below
```

### **Test 2: Login**
```
1. Use credentials you just registered
2. Enter Username and Password
3. Click "Login"

Expected: ✅ Redirected to /home page

If it fails:
→ Backend might still be connecting to MongoDB
→ Wait 2 minutes and retry
```

### **Test 3: Room Links (Mobile Test Critical)**
```
1. Go to: https://zoom-xepv-git-main-jayram-s-projects.vercel.app
2. Click "Join as Friend" → generates room code
3. Copy the link (should be like: /room-abc123xyz)

Test on MOBILE:
- Share link with friend OR
- Open link in mobile browser directly
- Should load WITHOUT 404 error

Expected: ✅ Video meeting page loads
          ✅ Can see WebRTC connection starting

If 404 error:
→ Vercel deployment may not have picked up vercel.json
→ See TROUBLESHOOTING: Vercel Still Showing 404
```

### **Test 4: Mobile Registration**
```
1. Open app on mobile browser
2. Try registering new user
3. Try logging in

Expected: ✅ Works same as desktop
          ✅ No CORS errors in console
```

---

## **TROUBLESHOOTING**

### **❌ "MongoDB buffering timed out after 10000ms"**
```
Cause: Backend can't connect to MongoDB
Solution:
1. Go to Render dashboard
2. Check your backend service logs (Logs tab)
3. Look for "MongoDB connected successfully" message
4. If not connected:
   - Check MONGODB_URI in Render environment variables
   - Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0
   - Verify password is correct (no special chars issues)
5. Wait 5-10 minutes (Render free tier is slow)
6. Retry registration
```

### **❌ Vercel Still Showing 404**
```
Cause: Vercel hasn't picked up vercel.json changes
Solution:
1. Hard refresh browser: Ctrl+Shift+Delete
2. Go to Vercel → Deployments
3. Find latest deployment
4. Click "Redeploy" button (don't rebuild)
5. Wait 2-3 minutes for redeployment
6. Test again

If still 404:
1. Verify frontend/vercel.json exists in GitHub (should show in repo)
2. Manually trigger rebuild from Vercel:
   - Settings → Git → Trigger a new deploy
3. Wait for full rebuild to complete
```

### **❌ CORS Errors on Mobile**
```
Expected: Should be fixed
If still occurring:
1. Check browser console (F12 → Console tab)
2. Look for "Access to XMLHttpRequest blocked by CORS"
3. This means backend URL is not in CORS whitelist
4. Go to Render → Environment variables
5. Verify FRONTEND_URL is set correctly
6. Redeploy backend
```

### **❌ Backend Not Starting**
```
Error appears in Render logs: "Port already in use" or "Cannot find module"
Solution:
1. Check Render service logs carefully
2. Go to backend/package.json → verify all dependencies
3. Try local test: npm install, npm run dev
4. If local test fails → dependency issue
5. If local test works → Render environment issue
6. Click "Restart" button on Render service
```

---

## **FINAL VERIFICATION**

Once all tests pass, you're ready for production! ✅

Run this checklist:
- [ ] Backend health check returns "connected"
- [ ] Registration works on desktop
- [ ] Login works on desktop  
- [ ] Room links generate correctly
- [ ] Room links work on mobile (no 404)
- [ ] Mobile registration works
- [ ] No CORS errors in console

---

## **NEED HELP?**

If any test fails:

1. **Check logs first**:
   - Vercel: Deployments → Click deployment → Logs
   - Render: Your backend service → Logs tab

2. **Check browser console**:
   - F12 → Console tab
   - Check for any error messages
   - Network tab → see failed requests

3. **Post logs from**:
   - Browser console errors
   - Render backend logs
   - Error message from registration

This will help identify the exact issue quickly!

---

**Estimated Time**: 15-20 minutes for all deployments and testing

**Status**: Changes are live and auto-deploying now! 🚀
