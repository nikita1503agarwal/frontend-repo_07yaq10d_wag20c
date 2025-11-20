import React, { useEffect, useMemo, useState } from 'react'
import { Layers, RefreshCw, PenSquare, Play, Copy, RotateCcw, ChevronRight } from 'lucide-react'

function povForChapter(povMode, number, defaultPov) {
  if (povMode === 'dual') {
    return number % 2 === 1 ? 'female' : 'male'
  }
  return defaultPov || 'female'
}

export default function ProjectWorkspace({ project }) {
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(false)
  const base = import.meta.env.VITE_BACKEND_URL || ''

  const init = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${base}/api/projects/${project.id}/chapters/init`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) setChapters(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { init() }, [project.id])

  const generate = async (num) => {
    setLoading(true)
    try {
      const res = await fetch(`${base}/api/projects/${project.id}/chapters/${num}/generate`, { method: 'POST' })
      const data = await res.json()
      if (data?.mode === 'prompt_only') {
        navigator.clipboard.writeText(data.prompt)
        alert('No LLM configured on server. Prompt copied to clipboard. Paste into your model, then use Edit to save the result.')
      } else if (res.ok) {
        setChapters(prev => prev.map(c => c.number === num ? data : c))
      }
    } finally {
      setLoading(false)
    }
  }

  const updateChapter = async (num, patch) => {
    const res = await fetch(`${base}/api/projects/${project.id}/chapters/${num}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    })
    const data = await res.json()
    if (res.ok) setChapters(prev => prev.map(c => c.number === num ? data : c))
  }

  return (
    <div className="bg-slate-800/50 border border-blue-500/20 rounded-2xl p-6 mt-6">
      <div className="flex items-center gap-2 text-white mb-4">
        <Layers className="w-5 h-5" />
        <h2 className="font-semibold">Chapters</h2>
      </div>
      {loading && <div className="text-blue-200 mb-3">Working...</div>}

      <div className="space-y-3">
        {chapters.map(ch => (
          <ChapterRow key={ch.number} ch={ch} project={project} onGenerate={() => generate(ch.number)} onUpdate={updateChapter} />
        ))}
      </div>

      {!chapters.length && (
        <button onClick={init} className="mt-2 px-3 py-2 rounded bg-slate-900/60 border border-slate-700 text-blue-200 hover:bg-slate-900">Initialize Chapters</button>
      )}
    </div>
  )
}

function ChapterRow({ ch, project, onGenerate, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(ch.title)
  const [content, setContent] = useState(ch.content)

  useEffect(() => { setTitle(ch.title); setContent(ch.content) }, [ch.title, ch.content])

  const resolvedPOV = ch.pov || povForChapter(project.pov_mode, ch.number, project.default_pov)
  const wordColor = ch.words < 1400 || ch.words > 1800 ? 'text-amber-400' : 'text-green-400'

  const copyChapter = async () => {
    await navigator.clipboard.writeText(`# ${title}\n\n${content}`)
  }

  const save = async () => {
    await onUpdate(ch.number, { title, content, status: 'draft' })
    setEditing(false)
  }

  const setPOV = async (pov) => {
    await onUpdate(ch.number, { pov })
  }

  return (
    <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-white font-medium">Chapter {ch.number} <span className="text-blue-300/80">• POV: {resolvedPOV}</span></div>
          <div className="text-blue-300/80 text-sm">Words: <span className={wordColor}>{ch.words}</span> (target 1400–1800)</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onGenerate} className="px-3 py-1.5 rounded bg-blue-600 text-white border border-blue-400 flex items-center gap-1"><Play className="w-4 h-4" />Generate</button>
          <button onClick={() => setEditing(v => !v)} className="px-3 py-1.5 rounded bg-slate-800 text-blue-200 border border-slate-600 flex items-center gap-1"><PenSquare className="w-4 h-4" />{editing ? 'Cancel' : 'Edit'}</button>
          <button onClick={copyChapter} className="px-3 py-1.5 rounded bg-slate-800 text-blue-200 border border-slate-600 flex items-center gap-1"><Copy className="w-4 h-4" />Copy</button>
        </div>
      </div>

      <div className="mt-2">
        <div className="text-blue-200 text-sm mb-1">POV Override:</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPOV('female')} className={`px-2 py-1 rounded text-xs border ${resolvedPOV === 'female' ? 'bg-blue-600/80 border-blue-400 text-white' : 'bg-slate-800 border-slate-600 text-blue-200'}`}>Female</button>
          <button onClick={() => setPOV('male')} className={`px-2 py-1 rounded text-xs border ${resolvedPOV === 'male' ? 'bg-blue-600/80 border-blue-400 text-white' : 'bg-slate-800 border-slate-600 text-blue-200'}`}>Male</button>
        </div>
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-950 text-white border border-slate-700" />
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={12} className="w-full px-3 py-2 rounded bg-slate-950 text-white border border-slate-700" />
          <div className="flex items-center gap-2">
            <button onClick={save} className="px-3 py-1.5 rounded bg-green-600 text-white border border-green-400">Save</button>
          </div>
        </div>
      ) : (
        <div className="prose prose-invert max-w-none mt-3">
          {ch.title && <h3 className="text-white text-lg font-semibold mb-2">{ch.title}</h3>}
          {ch.content ? (
            <div className="whitespace-pre-wrap text-blue-100/90 text-sm leading-6">{ch.content}</div>
          ) : (
            <div className="text-blue-300/80 text-sm">Not generated yet. Click Generate to create this chapter.</div>
          )}
        </div>
      )}
    </div>
  )
}
