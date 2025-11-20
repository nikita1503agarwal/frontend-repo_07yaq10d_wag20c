import React, { useState } from 'react'
import { BookText, Feather, History } from 'lucide-react'
import StorySetup from './components/StorySetup'
import ProjectWorkspace from './components/ProjectWorkspace'

function App() {
  const [project, setProject] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.06),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(147,197,253,0.06),transparent_40%)]" />

      <header className="relative z-10 px-6 py-6 border-b border-blue-500/10 flex items-center gap-3">
        <img src="/flame-icon.svg" className="w-8 h-8" />
        <h1 className="text-2xl font-semibold text-white">ChapterSmith AI – Complete Story Builder</h1>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto p-6">
        {!project ? (
          <>
            <div className="text-center mb-6">
              <p className="text-blue-200/80">Turn your outline into a complete 3–6 chapter story with consistent POV, pacing, and emotional continuity.</p>
            </div>
            <StorySetup onCreate={setProject} />
            <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-blue-500/20">
              <p className="text-blue-200/80 text-sm">POV Logic Preview:</p>
              <pre className="mt-2 text-xs text-blue-300/80">{`if (povMode === "female") {\n  chapterPOV = "female";\n} else if (povMode === "male") {\n  chapterPOV = "male";\n} else if (povMode === "dual") {\n  if (chapterNumber % 2 === 1) chapterPOV = "female";\n  else chapterPOV = "male";\n}`}</pre>
            </div>
          </>
        ) : (
          <ProjectWorkspace project={project} />
        )}

        <footer className="text-center text-blue-300/60 text-xs mt-10">All generated content is saved under project history. You can edit any chapter and regenerate as needed.</footer>
      </main>
    </div>
  )
}

export default App
