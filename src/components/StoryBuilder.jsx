import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Settings, FileText, Trash2, Copy, Plus, Loader2 } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "";

function classNames(...arr) {
  return arr.filter(Boolean).join(" ");
}

function TextArea({ label, value, onChange, rows = 12, placeholder }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-200">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl bg-slate-800/70 border border-slate-700 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-200">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberSelect({ label, value, onChange, min = 3, max = 6 }) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-200">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl bg-slate-800/70 border border-slate-700 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        {options.map((n) => (
          <option key={n} value={n}>
            {n} chapters
          </option>
        ))}
      </select>
    </div>
  );
}

function RuleCard() {
  return (
    <div className="rounded-2xl border border-blue-500/20 bg-slate-800/40 p-4">
      <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2"><Settings size={18}/> Writing Rules</div>
      <ul className="text-slate-300 text-sm space-y-2 list-disc pl-5">
        <li>Chapters are 1400–1800 words, complete yet forward-moving.</li>
        <li>Deep first-person POV. Default female unless changed.</li>
        <li>Dual POV alternates automatically between leads.</li>
        <li>Natural dialogue. Show, do not tell emotions.</li>
        <li>No poetic metaphors or dramatic fragments. Keep it grounded.</li>
      </ul>
    </div>
  );
}

function POVHelp() {
  return (
    <div className="rounded-2xl border border-fuchsia-500/20 bg-slate-800/40 p-4">
      <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2"><BookOpen size={18}/> POV Rules</div>
      <ul className="text-slate-300 text-sm space-y-2 list-disc pl-5">
        <li>All chapters use deep, immersive perspective.</li>
        <li>Default POV: Female (unless changed).</li>
        <li>Dual POV alternates automatically between leads.</li>
        <li>You can manually set POV per chapter if needed.</li>
      </ul>
    </div>
  );
}

export default function StoryBuilder() {
  const [name, setName] = useState("New Project");
  const [outline, setOutline] = useState("");
  const [chapterCount, setChapterCount] = useState(3);
  const [povMode, setPovMode] = useState("female");
  const [defaultPov, setDefaultPov] = useState("female");
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);

  const povOptions = [
    { value: "female", label: "Female Lead POV (default)" },
    { value: "male", label: "Male Lead POV" },
    { value: "dual", label: "Dual POV (alternate each chapter)" },
  ];

  const singlePovDefaultOptions = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
  ];

  const loadProjects = async () => {
    const res = await fetch(`${BACKEND}/api/projects`);
    const data = await res.json();
    setProjects(data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const create = async () => {
    if (!outline.trim()) return alert("Please paste your outline.");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, outline, chapter_count: chapterCount, pov_mode: povMode, default_pov: defaultPov, rules: [], tags: [] }),
      });
      const project = await res.json();
      setActive(project);
      await loadProjects();
      const chRes = await fetch(`${BACKEND}/api/projects/${project.id}/chapters`);
      setChapters(await chRes.json());
    } finally {
      setLoading(false);
    }
  };

  const openProject = async (p) => {
    setActive(p);
    const chRes = await fetch(`${BACKEND}/api/projects/${p.id}/chapters`);
    setChapters(await chRes.json());
  };

  const deleteProject = async (p) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`${BACKEND}/api/projects/${p.id}`, { method: "DELETE" });
    setActive(null);
    setChapters([]);
    await loadProjects();
  };

  const buildPrompt = async (projectId, number) => {
    const res = await fetch(`${BACKEND}/api/projects/${projectId}/chapters/${number}/prompt`, { method: "POST" });
    const data = await res.json();
    navigator.clipboard.writeText(data.prompt);
    setCopying(true);
    setTimeout(() => setCopying(false), 1500);
  };

  const copyChapter = async (text) => {
    await navigator.clipboard.writeText(text || "");
    setCopying(true);
    setTimeout(() => setCopying(false), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">ChapterSmith AI – Complete Story Builder</h1>
          <p className="text-slate-300 mt-2">Turn any outline into a complete story of 3–6 chapters with consistent POV, tone, and continuity.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Setup */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <TextArea label="Outline" value={outline} onChange={setOutline} rows={14} placeholder="Paste or upload your outline here..." />
                <div className="space-y-4">
                  <NumberSelect label="Chapter Count" value={chapterCount} onChange={setChapterCount} />
                  <Select label="POV Settings (Optional)" value={povMode} onChange={setPovMode} options={povOptions} />
                  {povMode !== "dual" && (
                    <Select label="Default POV" value={defaultPov} onChange={setDefaultPov} options={singlePovDefaultOptions} />
                  )}
                  <RuleCard />
                  <POVHelp />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={create} disabled={loading} className={classNames("inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 font-semibold", loading && "opacity-60")}>{loading ? (<Loader2 className="animate-spin" size={18}/>) : (<Plus size={18}/>)} Start Project</button>
              </div>
            </div>

            {/* Project List */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-semibold text-slate-200"><FileText size={18}/> Workspace History</div>
                <button onClick={loadProjects} className="text-sm text-blue-400">Refresh</button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {projects.map((p) => (
                  <div key={p.id} className={classNames("rounded-xl border p-3 cursor-pointer", active?.id===p.id?"border-blue-500 bg-blue-500/10":"border-slate-700 bg-slate-800/40")} onClick={() => openProject(p)}>
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.chapter_count} chapters • POV {p.pov_mode}</div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={(e)=>{e.stopPropagation(); openProject(p);}} className="text-xs text-blue-400">Open</button>
                      <button onClick={(e)=>{e.stopPropagation(); deleteProject(p);}} className="text-xs text-rose-400">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Chapters */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Chapters</div>
                {active && <div className="text-xs text-slate-400">POV Mode: {active.pov_mode}</div>}
              </div>
              {!active && <p className="text-slate-400 text-sm">Create or open a project to view chapters.</p>}
              <div className="space-y-4">
                {chapters.map((ch) => (
                  <div key={ch.id} className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{ch.title}</div>
                      <div className="text-xs text-slate-400">POV: {ch.pov}</div>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">Words: {ch.words}</div>
                    <div className="flex gap-2 mb-3">
                      <button onClick={() => buildPrompt(active.id, ch.number)} className="inline-flex items-center gap-1 text-xs rounded-lg border border-blue-500/30 px-2 py-1 text-blue-300 hover:bg-blue-500/10"><Copy size={14}/> Copy Prompt</button>
                      <button onClick={() => copyChapter(ch.content)} className="inline-flex items-center gap-1 text-xs rounded-lg border border-slate-500/30 px-2 py-1 text-slate-300 hover:bg-slate-500/10"><Copy size={14}/> Copy Chapter</button>
                    </div>
                    <textarea
                      value={ch.content}
                      onChange={async (e) => {
                        const content = e.target.value;
                        const res = await fetch(`${BACKEND}/api/projects/${active.id}/chapters/${ch.number}`, {
                          method: "PUT",
                          headers: {"Content-Type":"application/json"},
                          body: JSON.stringify({ content })
                        });
                        const updated = await res.json();
                        setChapters((prev) => prev.map((c) => c.number===ch.number? updated : c));
                      }}
                      rows={10}
                      className="w-full rounded-xl bg-slate-900/60 border border-slate-700 px-3 py-2 text-slate-100"
                      placeholder="Paste the generated chapter here or write manually..."
                    />
                  </div>
                ))}
              </div>
              {copying && <div className="mt-3 text-xs text-emerald-400">Copied to clipboard.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
