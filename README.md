# 🧠 MoodMap — Emotional Pattern Tracker

A deeply personal emotional intelligence app that helps you understand the hidden patterns behind your moods.

## Features

- **Quick Check-ins**: Log your mood in under 10 seconds using an emoji slider and optional voice note
- **AI Analysis**: Contextual analysis considering time of day, weather, sleep, social interactions, and calendar events
- **Weekly Mood Story**: Visual narrative summary of emotional highs and lows with identified triggers
- **Mood Forecast**: AI predictions for upcoming emotional risk zones
- **Gentle Nudges**: Smart reminders during historically low-mood windows
- **Privacy-First**: No social features, no sharing, no ads — just personal self-awareness

## Tech Stack

### Frontend
- React 18 + Vite
- TypeScript
- TailwindCSS

### Backend
- Python FastAPI
- MongoDB (with Motor async driver)
- OpenAI API for AI analysis

## Project Structure

```
moodmap/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/           # Python FastAPI
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:5173

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn main:app --reload
```

The backend API will run on http://localhost:8000

### API Endpoints

- `GET /` - API info
- `POST /api/checkins` - Log a new mood check-in
- `GET /api/checkins` - Get recent check-ins
- `GET /api/mood-story/weekly` - Generate weekly mood story
- `GET /api/forecast` - Get mood forecast
- `GET /api/nudges` - Get personalized nudges

## Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_here
PORT=8000
```

## License

MIT

---

**Note**: This is a privacy-first application. All data stays local to your instance.
