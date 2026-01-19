# ⚡ QUICK REFERENCE - Production Deployment

## 🔴 CRITICAL FIXES APPLIED

### 1. **MongoDB Connection Issue** ✅
**Problem**: `MONGODB_URI` undefined in production
**Solution**: Environment variables MUST be set in Render, not in .env file

```
Render Dashboard → Settings → Environment
Add: MONGODB_URI = your_connection_string
```

### 2. **SPA Routing 404** ✅
**Problem**: Refresh on `/room-abc` returns 404
**Solution**: vercel.json configured for SPA routing

```json
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```

### 3. **Cold Start Handling** ✅
**Problem**: Requests timeout during Render startup
**Solution**: Server starts immediately, retries DB connection

---

## 📋 YOUR ACTION CHECKLIST

- [ ] **Step 1**: Remove `.env` from Git
  ```bash
  git rm --cached backend/.env
  git add backend/.gitignore
  git commit -m "remove .env"
  ```

- [ ] **Step 2**: Set Render Environment Variables
  ```
  MONGODB_URI=mongodb+srv://...
  PORT=8001
  NODE_ENV=production
  FRONTEND_URL=https://zoom-xepv...vercel.app
  ```

- [ ] **Step 3**: Set Vercel Environment Variable
  ```
  VITE_BACKEND_URL=https://zoom-zako.onrender.com
  ```

- [ ] **Step 4**: Redeploy Both Services
  - Render: Manual Deploy
  - Vercel: Redeploy

- [ ] **Step 5**: Verify
  ```bash
  curl https://zoom-zako.onrender.com/health
  # Should return: {"status":"ok","database":"connected"}
  ```

---

## 🧪 QUICK TESTS

### Test Backend
```bash
# Health check
curl https://zoom-zako.onrender.com/health

# Expected: database: "connected"
```

### Test Frontend
```
1. Go to https://zoom-xepv-git-main-jayram-s-projects.vercel.app
2. Refresh page (should NOT show 404)
3. Try registration
4. Try /room-abc123 directly (should load)
```

### Test Mobile
```
1. Open frontend on mobile browser
2. Try registration
3. Join room via link
```

---

## 🚨 IF STILL HAVING ISSUES

### Backend shows `database: "disconnected"`
1. Check Render environment variables are set
2. Verify MongoDB connection string is correct
3. Test locally: `MONGODB_URI="..." npm start`
4. Check MongoDB Atlas IP whitelist includes 0.0.0.0/0

### Vercel shows 404 on refresh
1. Hard refresh: Ctrl+Shift+Delete
2. Check `frontend/vercel.json` exists
3. Vercel → Deployments → Redeploy

### Registration fails
1. Wait 30 seconds (Render cold start)
2. Check `/health` endpoint
3. Retry registration
4. If still fails, check Render logs

---

## 📞 KEY COMMANDS

```bash
# Check if .env in Git
git ls-files | grep backend/.env

# Remove .env from Git
git rm --cached backend/.env

# Test MongoDB connection locally
MONGODB_URI="your_uri" npm start

# Check backend health
curl -i https://zoom-zako.onrender.com/health
```

---

## 📊 EXPECTED BEHAVIOR

| Scenario | Expected | Issue If |
|----------|----------|----------|
| Page refresh | Loads app | Shows 404 |
| Direct `/room-abc` | Loads video page | Shows 404 |
| Registration | Creates user | Says "Something went wrong" |
| Cold start (first request) | 30-50s wait, then works | Always times out |
| Subsequent requests | Fast (<100ms) | Always slow |
| `/health` endpoint | `database: "connected"` | `database: "disconnected"` |

---

**Status**: All fixes deployed. Follow the checklist above to get production working! 🚀
