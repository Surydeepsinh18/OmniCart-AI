# 🚀 OmniCart AI - Deployment Guide

Iss project me Backend (`backend/`) aur Frontend (`frontend/`) complete aur structured hai. Aap isse **100% Free** niche diye gaye kisi bhi platform par deploy kar sakte hain.

---

## 🌐 1. Deploy on Render (Recommended - Free Web Service)

1. Apne GitHub repository ko [Render.com](https://render.com) se connect karein.
2. **New Web Service** select karein.
3. Settings enter karein:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Advance / Environment Variables me (Optional):
   - `PORT`: (Render automatically assigns dynamic port)
   - `MONGO_URI`: (Agar aapke paas MongoDB Atlas URL hai, to yaha daalein. Nahi hone par automatic fallback database use hoga).
5. **Deploy Web Service** par click karein.

---

## ⚡ 2. Deploy on Vercel

1. [Vercel.com](https://vercel.com) par login karke apna GitHub repository import karein.
2. Vercel automatically `vercel.json` file padh kar settings configuration kar lega:
   - Route `/api/*` -> `backend/server.js`
   - Static Files -> `frontend/`
3. **Deploy** button par click karein.

---

## 🚆 3. Deploy on Railway / Heroku

1. Repository connect karein.
2. Project me pehle se hi `Procfile` present hai:
   ```Procfile
   web: node backend/server.js
   ```
3. Platform automatically build space detect karke application run kar dega.

---

## 🐳 4. Deploy using Docker

Project me production ready `Dockerfile` and `.dockerignore` available hain.

Command run karein:
```bash
# Build Docker Image
docker build -t omnicart-ai .

# Run Container
docker run -p 3001:3001 omnicart-ai
```

---

## 📋 Checklist of Deployment Configuration Files Present:

- ✅ `backend/server.js` - Express Server listening on `process.env.PORT || 3001`
- ✅ `package.json` - Root dependencies & `"start": "node backend/server.js"`
- ✅ `backend/package.json` - Sub-directory deployment configuration
- ✅ `vercel.json` - Vercel serverless & static routing
- ✅ `render.yaml` - Render 1-click blueprint
- ✅ `Procfile` - Railway & Heroku web worker config
- ✅ `netlify.toml` - Netlify deployment config
- ✅ `Dockerfile` & `.dockerignore` - Containerized deployment
- ✅ `.env.example` - Environment variable template
- ✅ `frontend/` - Static asset bundle with relative API endpoints (`/api/...`)
