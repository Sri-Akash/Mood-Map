import { useState } from 'react'

const MOODS = [
  { emoji: '😄', label: 'Happy', value: 5, color: 'bg-mood-happy' },
  { emoji: '😊', label: 'Good', value: 4, color: 'bg-green-300' },
  { emoji: '😐', label: 'Neutral', value: 3, color: 'bg-mood-neutral' },
  { emoji: '😔', label: 'Low', value: 2, color: 'bg-mood-sad' },
  { emoji: '😠', label: 'Upset', value: 1, color: 'bg-mood-angry' },
]

function App() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [checkIns, setCheckIns] = useState<Array<{
    id: number
    mood: number
    note: string
    timestamp: Date
  }>>([])

  const handleSubmit = () => {
    if (selectedMood === null) return
    
    setCheckIns([...checkIns, {
      id: Date.now(),
      mood: selectedMood,
      note,
      timestamp: new Date()
    }])
    
    setSelectedMood(null)
    setNote('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">🧠 MoodMap</h1>
          <p className="text-gray-600 mt-1">Your emotional pattern tracker</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
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
            disabled={selectedMood === null}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              selectedMood !== null
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Log Check-in
          </button>
        </div>

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
                      {checkIn.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {checkIn.note && (
                    <p className="text-sm text-gray-600 italic">
                      "{checkIn.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-800 mb-2">Weekly Mood Story</h3>
            <p className="text-sm text-gray-600">
              Visual narrative of your emotional highs and lows with identified triggers
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl mb-3">🔮</div>
            <h3 className="font-semibold text-gray-800 mb-2">Mood Forecast</h3>
            <p className="text-sm text-gray-600">
              AI predictions for upcoming emotional risk zones based on your patterns
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="font-semibold text-gray-800 mb-2">Gentle Nudges</h3>
            <p className="text-sm text-gray-600">
              Smart reminders during historically low-mood windows
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
