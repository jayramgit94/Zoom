# 🎥 Zoom Clone - Video Conferencing Application

A feature-rich video conferencing application built with React, Node.js, WebRTC, and Socket.io. Similar to Zoom with real-time video calls, screen sharing, chat, and meeting history.

## ✨ Features

- 📹 **Real-time Video Calls** - High-quality peer-to-peer video streaming using WebRTC
- 🎤 **Audio Control** - Mute/Unmute microphone during calls
- 📺 **Screen Sharing** - Share your screen with participants
- 💬 **Live Chat** - Send messages during video calls
- 📱 **Meeting History** - Track all your meetings
- 👥 **Guest Join** - Join calls without authentication
- 🔐 **User Authentication** - Secure login and registration system
- 🌐 **Multi-peer Support** - Connect multiple participants in a single room

## 🛠️ Tech Stack

**Frontend:**
- React 19 with Vite
- Material-UI Components
- Socket.io Client
- WebRTC API
- Axios

**Backend:**
- Node.js/Express
- Socket.io Server
- MongoDB with Mongoose
- Bcrypt (Password Hashing)
- CORS

## 📦 Installation

### Quick Start (Local Development)

```bash
# Clone repository
git clone https://github.com/jayramgit94/Zoom.git
cd Zoom

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB credentials
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

✓ Open `http://localhost:8000` in your browser

## 🚀 Deployment

See [SETUP.md](SETUP.md) for detailed deployment instructions to:
- Render.com (Backend)
- Vercel (Frontend)

## 📋 Environment Variables

### Backend (.env)
```env
PORT=8001
MONGODB_URI=mongodb+srv://...
MONGO_USER=your_username
NODE_ENV=development
FRONTEND_URL=http://localhost:8000
```

### Frontend (.env.local)
```env
VITE_BACKEND_URL=http://localhost:8001
```

## 🎯 Usage

1. **Register/Login** - Create an account
2. **Enter Meeting Code** - Join existing meetings or create new ones
3. **Control Media** - Toggle video, audio, screen share
4. **Chat** - Send messages to other participants
5. **Logout** - End session safely

## 📁 Project Structure

```
Zoom/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
└── SETUP.md
```

## 🔒 Security Features

- Bcrypt password hashing
- JWT-based authentication
- Secure token storage
- CORS protection
- Environment variable configuration

## 🐛 Troubleshooting

- **Connection Issues**: Check backend is running on correct port
- **MongoDB Errors**: Verify MONGODB_URI and IP whitelist
- **Video Not Working**: Grant browser permissions for camera/microphone
- **Screen Share Not Available**: Use Chrome, Edge, or Firefox

See [SETUP.md](SETUP.md) for detailed troubleshooting guide.

## 🤝 Contributing

Feel free to fork, modify, and improve!

## 📄 License

MIT License - Feel free to use this project

## 👤 Author

**Jayram** - [GitHub](https://github.com/jayramgit94)
**Live Link** - [Zoom](https://zoom-xepv-8fwye1l48-jayram-s-projects.vercel.app/)

---

**Ready to Deploy?** Check [SETUP.md](SETUP.md) for step-by-step instructions! 🚀
