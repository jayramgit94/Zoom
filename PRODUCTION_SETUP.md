# 🚀 Production Deployment Setup - URGENT

## **CRITICAL: Complete These Steps NOW**

### **Step 1: Set Backend URL in Vercel (MOST IMPORTANT)**
```
1. Go to: https://vercel.com/dashboard
2. Select your "Zoom" project
3. Settings → Environment Variables
4. Add NEW variable:
   - Name: VITE_BACKEND_URL
   - Value: https://your-render-backend-url.onrender.com
   - (Get this from your Render.com deployment)
5. Click "Save"
6. Redeploy (Settings → Deployments → Redeploy)
```

**Without this, registration/API calls WILL FAIL!**

---

### **Step 2: Verify Backend is Running**
```bash
# Check your Render.com dashboard
# Your backend should show: "Live"
# Access: https://your-render-backend-url.onrender.com/api/v1/user/register

# Should return 404 for GET (expected) - proves backend is responding
```

---

### **Step 3: Check Mobile Routing**
✅ `vercel.json` has been added to fix 404 on room routes
- The `/room-05a3n5` route should now work
- All React Router paths will be served properly

---

## **Troubleshooting**

### **Still Getting 404?**
1. Check browser console (F12) - see actual error message
2. Open Network tab - check if registration request goes to backend
3. Verify `VITE_BACKEND_URL` is set in Vercel (must be EXACT URL)

### **Registration Still Failing?**
1. Backend might not be running - check Render.com dashboard
2. Check backend logs for error messages
3. Verify MongoDB connection is working
4. Ensure CORS includes your Vercel URL

### **Mobile App Not Loading?**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check Network tab for failed requests
4. Verify Socket.io connects (should see "SOMETHING CONNECTED" in backend logs)

---

## **Files Changed**
- ✅ `frontend/src/environment.js` - Removed hardcoded fallback URL
- ✅ `frontend/vercel.json` - Added SPA routing configuration
- ✅ `backend/src/controllers/socketManager.js` - Fixed CORS for mobile/Vercel

---

## **Next: Commit and Deploy**
```bash
git add .
git commit -m "fix: production setup - add Vercel config and fix CORS for mobile"
git push origin main
```

Vercel will auto-redeploy. Check dashboard for completion.
