
# AgriMarket - Fresh Connect

A sophisticated agricultural marketplace connecting farmers directly with buyers.

## 🚀 Local Development

### 1. Frontend (React + Gemini API)
- **Install deps:** `npm install`
- **Configure Env:** Create `.env` and add `VITE_API_KEY=your_gemini_key`
- **Run:** `npm run dev`

### 2. Backend (FastAPI + PostgreSQL)
- **Environment:** `python -m venv venv && source venv/bin/activate`
- **Install deps:** `pip install -r requirements.txt`
- **Database:** Ensure PostgreSQL with PostGIS is running.
- **Run:** `uvicorn app.main:app --reload`

## 🌍 Deployment

### Frontend (Vercel)
1. Push to GitHub.
2. Link to Vercel.
3. Add `API_KEY` to Environment Variables.

### Backend (Railway/Render)
1. Provision a PostgreSQL + PostGIS database.
2. Deploy FastAPI app.
3. Set `DATABASE_URL` and `CLOUDINARY_URL` in environment.

## 🤖 AI Features
This app uses **Gemini 3 Flash** for:
- Auto-generating listing descriptions.
- Market price suggestions.
- Agricultural advisory chat for farmers.
