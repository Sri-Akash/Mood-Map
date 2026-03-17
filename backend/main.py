from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uvicorn

app = FastAPI(title="MoodMap API", description="Emotional Pattern Tracker Backend")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums
class MoodLevel(int, Enum):
    UPSET = 1
    LOW = 2
    NEUTRAL = 3
    GOOD = 4
    HAPPY = 5

# Models
class CheckIn(BaseModel):
    mood: MoodLevel = Field(..., description="Mood level from 1 (upset) to 5 (happy)")
    note: Optional[str] = Field(None, max_length=500)
    voice_note_url: Optional[str] = None
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    weather_context: Optional[str] = None
    social_interactions: Optional[int] = Field(None, ge=0)
    calendar_events: Optional[List[str]] = []

class CheckInResponse(CheckIn):
    id: str
    user_id: str
    timestamp: datetime
    ai_analysis: Optional[str] = None

class MoodStory(BaseModel):
    week_start: datetime
    week_end: datetime
    average_mood: float
    highs: List[CheckInResponse]
    lows: List[CheckInResponse]
    identified_triggers: List[str]
    narrative: str

class MoodForecast(BaseModel):
    date: datetime
    predicted_mood: float
    confidence: float
    risk_factors: List[str]
    recommendations: List[str]

class NudgeReminder(BaseModel):
    id: str
    message: str
    scheduled_time: datetime
    is_active: bool

# In-memory storage (replace with MongoDB in production)
checkins_db: List[CheckInResponse] = []
users_db: dict = {}

@app.get("/")
async def root():
    return {
        "message": "Welcome to MoodMap API",
        "version": "1.0.0",
        "features": ["Check-ins", "Mood Stories", "Forecasts", "Nudges"]
    }

@app.post("/api/checkins", response_model=CheckInResponse)
async def create_checkin(checkin: CheckIn):
    """Log a new mood check-in (under 10 seconds)"""
    checkin_id = f"checkin_{len(checkins_db) + 1}"
    user_id = "user_demo"  # Replace with actual auth
    
    # Simple AI analysis simulation
    ai_analysis = generate_ai_analysis(checkin)
    
    response = CheckInResponse(
        id=checkin_id,
        user_id=user_id,
        timestamp=datetime.now(),
        mood=checkin.mood,
        note=checkin.note,
        voice_note_url=checkin.voice_note_url,
        sleep_hours=checkin.sleep_hours,
        weather_context=checkin.weather_context,
        social_interactions=checkin.social_interactions,
        calendar_events=checkin.calendar_events,
        ai_analysis=ai_analysis
    )
    
    checkins_db.append(response)
    return response

@app.get("/api/checkins", response_model=List[CheckInResponse])
async def get_checkins(
    limit: int = 10,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Get recent check-ins with optional date filtering"""
    filtered = checkins_db
    
    if start_date:
        filtered = [c for c in filtered if c.timestamp >= start_date]
    if end_date:
        filtered = [c for c in filtered if c.timestamp <= end_date]
    
    return filtered[-limit:]

@app.get("/api/mood-story/weekly", response_model=MoodStory)
async def get_weekly_mood_story(week_offset: int = 0):
    """Generate weekly mood story with narrative and triggers"""
    if not checkins_db:
        raise HTTPException(status_code=404, detail="No check-ins found")
    
    # Calculate statistics
    moods = [c.mood.value for c in checkins_db]
    avg_mood = sum(moods) / len(moods)
    
    # Identify highs and lows
    highs = [c for c in checkins_db if c.mood.value >= 4]
    lows = [c for c in checkins_db if c.mood.value <= 2]
    
    # Identify triggers (simplified logic)
    triggers = identify_triggers(checkins_db)
    
    # Generate narrative
    narrative = generate_native(avg_mood, highs, lows, triggers)
    
    return MoodStory(
        week_start=datetime.now(),
        week_end=datetime.now(),
        average_mood=avg_mood,
        highs=highs[:5],
        lows=lows[:5],
        identified_triggers=triggers,
        narrative=narrative
    )

@app.get("/api/forecast", response_model=List[MoodForecast])
async def get_mood_forecast(days: int = 7):
    """Predict upcoming emotional risk zones"""
    forecasts = []
    
    for i in range(days):
        forecast_date = datetime.now()
        # Simplified prediction logic
        predicted_mood = 3.5  # Default neutral-positive
        
        forecasts.append(MoodForecast(
            date=forecast_date,
            predicted_mood=predicted_mood,
            confidence=0.75,
            risk_factors=["Low sleep pattern detected", "Busy calendar"],
            recommendations=[
                "Schedule 20 min break",
                "Practice mindfulness",
                "Connect with a friend"
            ]
        ))
    
    return forecasts

@app.get("/api/nudges", response_model=List[NudgeReminder])
async def get_nudges():
    """Get personalized nudge reminders based on historical patterns"""
    return [
        NudgeReminder(
            id="nudge_1",
            message="You tend to feel drained on Tuesday afternoons — want to block 20 minutes for yourself?",
            scheduled_time=datetime.now(),
            is_active=True
        ),
        NudgeReminder(
            id="nudge_2",
            message="Morning check-ins show better moods. Keep up the great start!",
            scheduled_time=datetime.now(),
            is_active=True
        )
    ]

def generate_ai_analysis(checkin: CheckIn) -> str:
    """Simulate AI analysis of mood check-in"""
    mood_descriptions = {
        1: "upset/stressed",
        2: "low energy",
        3: "balanced/neutral",
        4: "positive/good",
        5: "happy/energized"
    }
    
    analysis = f"You're feeling {mood_descriptions.get(checkin.mood.value, 'unknown')}. "
    
    if checkin.sleep_hours and checkin.sleep_hours < 6:
        analysis += "Low sleep may be affecting your mood. "
    elif checkin.sleep_hours and checkin.sleep_hours > 8:
        analysis += "Good rest seems to be helping. "
    
    if checkin.social_interactions and checkin.social_interactions > 5:
        analysis += "High social activity noted. "
    
    return analysis

def identify_triggers(checkins: List[CheckInResponse]) -> List[str]:
    """Identify potential mood triggers from check-in data"""
    triggers = []
    
    low_moods = [c for c in checkins if c.mood.value <= 2]
    high_moods = [c for c in checkins if c.mood.value >= 4]
    
    # Analyze patterns
    low_sleep_count = sum(1 for c in low_moods if c.sleep_hours and c.sleep_hours < 6)
    if low_sleep_count > len(low_moods) * 0.5:
        triggers.append("Insufficient sleep correlates with low moods")
    
    # Add more trigger detection logic here
    
    if not triggers:
        triggers.append("No strong patterns detected yet - keep logging!")
    
    return triggers

def generate_native(avg_mood: float, highs: List, lows: List, triggers: List) -> str:
    """Generate narrative summary of the week"""
    if avg_mood >= 4:
        mood_summary = "a predominantly positive week"
    elif avg_mood >= 3:
        mood_summary = "a balanced week with ups and downs"
    else:
        mood_summary = "a challenging week emotionally"
    
    narrative = f"This week was {mood_summary} (average mood: {avg_mood:.1f}/5). "
    
    if highs:
        narrative += f"You experienced {len(highs)} notable high moments. "
    if lows:
        narrative += f"There were {len(lows)} low points worth reflecting on. "
    
    if triggers and triggers[0] != "No strong patterns detected yet - keep logging!":
        narrative += f"Key insight: {triggers[0]}. "
    
    return narrative

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
