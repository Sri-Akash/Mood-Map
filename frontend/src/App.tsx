import { useState, useEffect } from 'react'

const MOODS = [
  { emoji: '😄', label: 'Happy', value: 5, color: 'bg-mood-happy' },
  { emoji: '😊', label: 'Good', value: 4, color: 'bg-green-300' },
  { emoji: '😐', label: 'Neutral', value: 3, color: 'bg-mood-neutral' },
  { emoji: '😔', label: 'Low', value: 2, color: 'bg-mood-sad' },
  { emoji: '😠', label: 'Upset', value: 1, color: 'bg-mood-angry' },
]

const API_URL = 'http://localhost:8000'

interface CheckInData {
  id: string
  mood: number
  note?: string
  timestamp: string
  ai_analysis?: string
  sleep_hours?: number
  social_interactions?: number
}

interface MoodStory {
  week_start: string
  week_end: string
  average_mood: number
  highs: CheckInData[]
  lows: CheckInData[]
  identified_triggers: string[]
  narrative: string
}

interface MoodForecast {
  date: string
  predicted_mood: number
  confidence: number
  risk_factors: string[]
  recommendations: string[]
}

interface NudgeReminder {
  id: string
  message: string
  scheduled_time: string
  is_active: boolean
}

type Tab = 'checkin' | 'story' | 'forecast' | 'nudges'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('checkin')
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [checkIns, setCheckIns] = useState<CheckInData[]>([])
  const [moodStory, setMoodStory] = useState<MoodStory | null>(null)
  const [forecasts, setForecasts] = useState<MoodForecast[]>([])
  const [nudges, setNudges] = useState<NudgeReminder[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sleepHours, setSleepHours] = useState<number | ''>('')
  const [socialInteractions, setSocialInteractions] = useState<number | ''>('')

  // Load initial data
  useEffect(() => {
    loadCheckIns()
    loadForecasts()
    loadNudges()
  }, [])

  const loadCheckIns = async () => {
    try {
      const response = await fetch(`${API_URL}/api/checkins?limit=10`)
      if (response.ok) {
        const data = await response.json()
        setCheckIns(data)
      }
    } catch (err) {
      console.error('Error loading check-ins:', err)
    }
  }

  const loadForecasts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/forecast?days=7`)
      if (response.ok) {
        const data = await response.json()
        setForecasts(data)
      }
    } catch (err) {
      console.error('Error loading forecasts:', err)
    }
  }

  const loadNudges = async () => {
    try {
      const response = await fetch(`${API_URL}/api/nudges`)
      if (response.ok) {
        const data = await response.json()
        setNudges(data)
      }
    } catch (err) {
      console.error('Error loading nudges:', err)
    }
  }

  const loadMoodStory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/mood-story/weekly`)
      if (response.ok) {
        const data = await response.json()
        setMoodStory(data)
      }
    } catch (err) {
      setError('Failed to load mood story')
      console.error('Error loading mood story:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (selectedMood === null) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const payload: any = {
        mood: selectedMood,
        note: note || null,
      }
      
      if (sleepHours !== '') {
        payload.sleep_hours = Number(sleepHours)
      }
      
      if (socialInteractions !== '') {
        payload.social_interactions = Number(socialInteractions)
      }
      
      console.log('Submitting check-in:', payload)
      
      const response = await fetch(`${API_URL}/api/checkins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server error:', errorText)
        throw new Error(`Failed to submit check-in: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Received data:', data)
      
      setCheckIns(prev => [...prev, data])
      
      setSelectedMood(null)
      setNote('')
      setSleepHours('')
      setSocialInteractions('')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMsg)
      console.error('Error submitting check-in:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">🧠 MoodMap</h1>
          <p className="text-gray-600 mt-1">Your emotional pattern tracker</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'checkin', label: 'Check-in', icon: '✍️' },
              { id: 'story', label: 'Mood Story', icon: '📊' },
              { id: 'forecast', label: 'Forecast', icon: '🔮' },
              { id: 'nudges', label: 'Nudges', icon: '💡' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Check-in Tab */}
        {activeTab === 'checkin' && (
          <>
            {/* Quick Check-in Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                How are you feeling right now?
              </h2>
              
              {/* Emoji Slider */}
              <div className="flex justify-between items-center mb-6">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 ${
                      selectedMood === mood.value
                        ? `${mood.color} ring-4 ring-offset-2 ring-purple-400 scale-110`
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-4xl mb-2">{mood.emoji}</span>
                    <span className="text-sm text-gray-600">{mood.label}</span>
                  </button>
                ))}
              </div>

              {/* Context Inputs */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    😴 Sleep hours last night
                  </label>
                  <input
                    type="number"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.valueAsNumber || '')}
                    placeholder="e.g., 7.5"
                    min="0"
                    max="24"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👥 Social interactions today
                  </label>
                  <input
                    type="number"
                    value={socialInteractions}
                    onChange={(e) => setSocialInteractions(e.target.valueAsNumber || '')}
                    placeholder="e.g., 5"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Voice Note */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optional voice note (under 10 seconds)
                </label>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl">🎤</span>
                  {isRecording ? 'Recording...' : 'Record Voice Note'}
                </button>
              </div>

              {/* Text Note */}
              <div className="mb-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a quick note (optional)..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={selectedMood === null || isLoading}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  selectedMood !== null && !isLoading
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Submitting...' : 'Log Check-in'}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
                {error}
              </div>
            )}

            {/* Recent Check-ins */}
            {checkIns.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Recent Check-ins
                </h2>
                <div className="space-y-3">
                  {checkIns.map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <span className="text-3xl">
                        {MOODS.find(m => m.value === checkIn.mood)?.emoji}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {MOODS.find(m => m.value === checkIn.mood)?.label}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(checkIn.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {checkIn.note && (
                        <p className="text-sm text-gray-600 italic">
                          "{checkIn.note}"
                        </p>
                      )}
                      {checkIn.ai_analysis && (
                        <p className="text-xs text-purple-600 mt-1">
                          💡 {checkIn.ai_analysis}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Mood Story Tab */}
        {activeTab === 'story' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">📊 Weekly Mood Story</h2>
              <button
                onClick={loadMoodStory}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Generate Story'}
              </button>
            </div>
            
            {moodStory ? (
              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">{moodStory.narrative}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-green-700 mb-2">😊 Highs ({moodStory.highs.length})</h3>
                    <ul className="space-y-2">
                      {moodStory.highs.slice(0, 3).map((high, i) => (
                        <li key={i} className="text-sm text-gray-700">
                          {new Date(high.timestamp).toLocaleDateString()} - {MOODS.find(m => m.value === high.mood)?.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-700 mb-2">😔 Lows ({moodStory.lows.length})</h3>
                    <ul className="space-y-2">
                      {moodStory.lows.slice(0, 3).map((low, i) => (
                        <li key={i} className="text-sm text-gray-700">
                          {new Date(low.timestamp).toLocaleDateString()} - {MOODS.find(m => m.value === low.mood)?.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">🔍 Identified Triggers</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {moodStory.identified_triggers.map((trigger, i) => (
                      <li key={i} className="text-sm text-gray-700">{trigger}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="text-center py-4">
                  <p className="text-2xl font-bold text-purple-600">
                    Average Mood: {moodStory.average_mood.toFixed(1)}/5
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-4">📖</p>
                <p>Click "Generate Story" to see your weekly mood narrative</p>
                <p className="text-sm mt-2">You need some check-ins first!</p>
              </div>
            )}
          </div>
        )}

        {/* Forecast Tab */}
        {activeTab === 'forecast' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">🔮 Mood Forecast</h2>
            
            {forecasts.length > 0 ? (
              <div className="space-y-4">
                {forecasts.map((forecast, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {new Date(forecast.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-gray-500">Confidence: {(forecast.confidence * 100).toFixed(0)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{forecast.predicted_mood.toFixed(1)}/5</p>
                        <p className="text-xs text-gray-500">Predicted Mood</p>
                      </div>
                    </div>
                    
                    {forecast.risk_factors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-orange-600 mb-1">⚠️ Risk Factors:</p>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {forecast.risk_factors.map((factor, j) => (
                            <li key={j}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {forecast.recommendations.length > 0 && (
                      <div className="mt-3 bg-purple-50 p-3 rounded">
                        <p className="text-sm font-medium text-purple-800 mb-1">💡 Recommendations:</p>
                        <ul className="text-sm text-purple-700 list-disc list-inside">
                          {forecast.recommendations.map((rec, j) => (
                            <li key={j}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-4">🔮</p>
                <p>Loading forecast...</p>
              </div>
            )}
          </div>
        )}

        {/* Nudges Tab */}
        {activeTab === 'nudges' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">💡 Gentle Nudges</h2>
            
            {nudges.length > 0 ? (
              <div className="space-y-4">
                {nudges.map((nudge) => (
                  <div 
                    key={nudge.id} 
                    className={`border-l-4 p-4 rounded-r-lg ${
                      nudge.is_active 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-gray-800">{nudge.message}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        nudge.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {nudge.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Scheduled: {new Date(nudge.scheduled_time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-4">💡</p>
                <p>Loading nudges...</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
