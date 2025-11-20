import React, { useState } from 'react'
import { BookOpen, Settings, Copy, Sparkles } from 'lucide-react'

const POV_OPTIONS = [
  { value: 'female', label: 'Female Lead POV (default)' },
  { value: 'male', label: 'Male Lead POV' },
  { value: 'dual', label: 'Dual POV (alternate by chapter)' },
]

const CHAPTER_OPTIONS = [3, 4, 5, 6]

export default function StorySetup({ onCreate }) {
  const [name, setName] = useState('New Project')
  const [outline, setOutline] = useState('')
  const [chapters, setChapters] = useState(3)
  const [povMode, setPovMode] = useState('female')
  const [creating, setCreating] = useState(false)

  const rulesPreset = [
    'Each chapter must be strictly between 1400 and 1800 words. Do not write less than 1400 words, and do not exceed 1800 words. Ensure the chapter feels complete and cohesive while staying within this word count.',
    'Write in immersive first-person POV matching selected POV settings. Use full sentences and personal pronouns like I, my, and me. Avoid fragmented, dramatic lines.',
    'Dialogue must sound natural and reveal emotion through tone, pauses, and body language. Do not name emotions directly.',
    'Avoid metaphors, similes, purple prose, and dash-separated adjective lists. Keep tone grounded and human.',
    'Start each chapter with tension, action, or dialogue; end with a hook or strong emotional beat. Maintain continuity across chapters.',
  ]

  const handleCreate = async () => {
    if (!outline.trim()) {
      alert('Please paste your outline to continue.')
      return
    }
    setCreating(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          outline,
          chapter_count: chapters,
          pov_mode: povMode,
          default_pov: povMode === 'male' ? 'male' : 'female',
          rules: rulesPreset,
          tags: [],
        })
      })
      const data = await res.json()
      if (res.ok) {
        onCreate?.(data)
      } else {
        throw new Error(data?.detail || 'Failed to create project')
      }
    } catch (e) {
      alert(e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="bg-slate-800/50 border border-blue-500/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 text-white mb-4">
        <BookOpen className="w-5 h-5" />
        <h2 className="font-semibold">Story Setup</h2>
      </div>

      <label className="block text-sm text-blue-200 mb-1">Project Name</label>
      <input value={name} onChange={e => setName(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded bg-slate-900/60 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />

      <label className="block text-sm text-blue-200 mb-1">Outline</label>
      <textarea value={outline} onChange={e => setOutline(e.target.value)} rows={10}
        placeholder="Paste your scene-by-scene outline here..."
        className="w-full mb-4 px-3 py-2 rounded bg-slate-900/60 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-blue-200 mb-1">Chapter Count</label>
          <select value={chapters} onChange={e => setChapters(parseInt(e.target.value))}
            className="w-full px-3 py-2 rounded bg-slate-900/60 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {CHAPTER_OPTIONS.map(n => (
              <option key={n} value={n}>{n} chapters</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-white mb-2">
            <Settings className="w-4 h-4" />
            <span className="text-sm">POV Settings (Optional)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {POV_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setPovMode(opt.value)}
                className={`px-3 py-2 rounded border text-sm ${povMode === opt.value ? 'bg-blue-600/80 border-blue-400 text-white' : 'bg-slate-900/60 border-slate-700 text-blue-200'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mt-3 text-blue-200/80 text-sm">
            <p className="mb-1 font-medium">POV Rules:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All chapters use deep, immersive perspective.</li>
              <li>Default POV: Female (unless changed).</li>
              <li>Dual POV alternates automatically between leads.</li>
              <li>Users can manually set the POV for individual chapters after generation.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="text-blue-200/80 text-xs max-w-xl">
          "Each chapter must be strictly between 1400 and 1800 words. Do not write less than 1400 words, and do not exceed 1800 words. Ensure the chapter feels complete and cohesive while staying within this word count."
        </div>
        <button disabled={creating} onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 disabled:opacity-60">
          <Sparkles className="w-4 h-4" />
          {creating ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </div>
  )
}
