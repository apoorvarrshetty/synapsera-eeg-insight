/**
 * EEG Report Explainer — AI-powered educational neurotech tool
 *
 * Single-file build for live preview. In the GitHub repo, split along the
 * "── component ──" markers into src/components, src/lib, src/data, src/pages.
 *
 * Educational tool only. Not a medical device. Not clinical advice.
 */

import { useState, useEffect, useRef } from "react";
import {
  Brain,
  Activity,
  Sparkles,
  FlaskConical,
  X,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  ShieldAlert,
  ClipboardList,
  Loader2,
  AlertTriangle,
} from "lucide-react";

/* ────────────────────────────── design tokens ───────────────────────────── */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #F6F9FD;
  --surface: #FFFFFF;
  --ink: #0E1B2E;
  --ink-soft: #4A5A72;
  --ink-faint: #8395AC;
  --blue: #1D5BF0;
  --blue-deep: #0F3FB5;
  --blue-tint: #E8F0FE;
  --line: #E3EAF4;
  --ok: #0E8A5F;
  --ok-tint: #E4F5EE;
  --warn: #B45309;
  --warn-tint: #FDF1E0;
  --neutral-tint: #EEF2F8;
  --radius: 20px;
  --shadow: 0 1px 2px rgba(14,27,46,0.04), 0 8px 24px rgba(14,27,46,0.06);
  --shadow-lift: 0 2px 4px rgba(14,27,46,0.05), 0 16px 40px rgba(29,91,240,0.10);
}

* { box-sizing: border-box; }

.eeg-app {
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 15.5px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.eeg-app h1, .eeg-app h2, .eeg-app h3 {
  font-family: 'Sora', system-ui, sans-serif;
  margin: 0;
  letter-spacing: -0.02em;
}

/* channel-label eyebrow — borrowed from EEG montage readouts */
.channel-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--blue);
}

.wrap { max-width: 1060px; margin: 0 auto; padding: 0 24px; }

/* nav */
.nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(246,249,253,0.82);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line);
}
.nav-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.nav-brand { display: flex; align-items: center; gap: 10px; font-family: 'Sora'; font-weight: 600; font-size: 16px; cursor: pointer; background: none; border: none; color: var(--ink); }
.nav-links { display: flex; gap: 6px; }
.nav-link {
  background: none; border: none; cursor: pointer;
  font: 500 14px 'Inter', sans-serif; color: var(--ink-soft);
  padding: 8px 14px; border-radius: 10px; transition: background .15s, color .15s;
}
.nav-link:hover { background: var(--blue-tint); color: var(--blue-deep); }
.nav-link.active { background: var(--blue-tint); color: var(--blue-deep); }
.nav-link:focus-visible, .btn:focus-visible, .nav-brand:focus-visible {
  outline: 2px solid var(--blue); outline-offset: 2px;
}

/* hero */
.hero { padding: 72px 0 24px; text-align: center; }
.hero h1 { font-size: clamp(32px, 5vw, 50px); font-weight: 700; }
.hero h1 .accent { color: var(--blue); }
.hero p.sub {
  max-width: 560px; margin: 16px auto 0;
  color: var(--ink-soft); font-size: 17px;
}
.hero .channel-label { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 18px; padding: 6px 14px; background: var(--blue-tint); border-radius: 999px; }

/* live EEG trace */
.trace-box { margin: 36px auto 0; max-width: 720px; overflow: hidden; }
.trace-path {
  stroke: var(--blue); stroke-width: 2; fill: none;
  stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 1400; stroke-dashoffset: 1400;
  animation: draw 3.2s ease-out forwards, drift 9s ease-in-out 3.2s infinite alternate;
}
@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes drift { from { opacity: 1; } to { opacity: 0.55; } }
@media (prefers-reduced-motion: reduce) {
  .trace-path { animation: none; stroke-dashoffset: 0; }
  .card, .results-grid { animation: none !important; }
}

/* input panel */
.panel {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius); box-shadow: var(--shadow);
  padding: 24px; margin: 40px 0 0;
  transition: box-shadow .2s;
}
.panel:focus-within { box-shadow: var(--shadow-lift); }
.panel textarea {
  width: 100%;
  min-height: 220px;
  resize: vertical;
  border: 1px solid var(--line);
  outline: none;
  background: #F8FAFC;
  border-radius: 14px;
  padding: 18px;
  font: 400 13.5px/1.7 'JetBrains Mono', monospace;
  color: var(--ink);
}

.panel textarea:focus {
  border-color: var(--blue);
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(29, 91, 240, 0.10);
}
.panel textarea::placeholder { color: var(--ink-faint); }
.panel-foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap; margin-top: 16px; padding-top: 16px;
  border-top: 1px solid var(--line);
}
.char-count { font: 500 12px 'JetBrains Mono', monospace; color: var(--ink-faint); }

/* buttons */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  font: 600 14px 'Inter', sans-serif; cursor: pointer;
  border-radius: 12px; padding: 11px 20px; border: 1px solid transparent;
  transition: transform .12s, box-shadow .15s, background .15s;
}
.btn:active { transform: scale(0.98); }
.btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
.btn-primary { background: var(--blue); color: #fff; box-shadow: 0 4px 14px rgba(29,91,240,0.28); }
.btn-primary:hover:not(:disabled) { background: var(--blue-deep); }
.btn-ghost { background: var(--surface); color: var(--ink-soft); border-color: var(--line); }
.btn-ghost:hover:not(:disabled) { background: var(--neutral-tint); color: var(--ink); }
.btn-group { display: flex; gap: 10px; flex-wrap: wrap; }

/* results */
.results { padding: 48px 0 80px; }
.results-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  animation: rise .5s ease both;
}
@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.card {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius); box-shadow: var(--shadow);
  padding: 26px; animation: rise .5s ease both;
}
.card.span-2 { grid-column: 1 / -1; }
.card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.card-icon {
  width: 38px; height: 38px; border-radius: 12px;
  display: grid; place-items: center; flex-shrink: 0;
  background: var(--blue-tint); color: var(--blue);
}
.card h3 { font-size: 16.5px; font-weight: 600; }
.card p { margin: 0; color: var(--ink-soft); }
.card ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px; }

/* findings */
.finding { display: flex; gap: 10px; align-items: flex-start; }
.tag {
  font: 600 10.5px 'JetBrains Mono', monospace; letter-spacing: 0.08em;
  text-transform: uppercase; padding: 3px 9px; border-radius: 999px;
  flex-shrink: 0; margin-top: 3px;
}
.tag-normal { background: var(--ok-tint); color: var(--ok); }
.tag-abnormal { background: var(--warn-tint); color: var(--warn); }
.tag-nonspecific { background: var(--neutral-tint); color: var(--ink-soft); }
.finding span.txt { color: var(--ink-soft); }

/* terms */
.term dt { font-weight: 600; font-size: 14.5px; color: var(--ink); font-family: 'Sora'; }
.term dd { margin: 3px 0 0; color: var(--ink-soft); font-size: 14.5px; }
.card dl { margin: 0; display: flex; flex-direction: column; gap: 14px; }

/* disclaimer card */
.card.disclaimer { background: linear-gradient(180deg, #FFFDF7, #FFFBF0); border-color: #F1E4C4; }
.card.disclaimer .card-icon { background: var(--warn-tint); color: var(--warn); }
.card.disclaimer p { font-size: 14px; }

/* skeleton loading */
.skeleton { position: relative; overflow: hidden; min-height: 130px; }
.skeleton .bar {
  height: 12px; border-radius: 6px; background: var(--neutral-tint);
  margin-bottom: 12px; animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }

/* empty state */
.empty {
  text-align: center; padding: 56px 24px; color: var(--ink-faint);
  border: 1.5px dashed var(--line); border-radius: var(--radius);
}
.empty svg { margin-bottom: 12px; opacity: 0.5; }

/* error */
.error-box {
  display: flex; gap: 12px; align-items: flex-start;
  background: var(--warn-tint); border: 1px solid #EFD9B4;
  border-radius: 14px; padding: 16px 18px; color: var(--warn);
  font-size: 14px;
}

/* static pages */
.page { padding: 64px 0 96px; max-width: 680px; margin: 0 auto; }
.page h2 { font-size: 30px; margin-bottom: 8px; }
.page h3 { font-size: 18px; margin: 28px 0 8px; }
.page p { color: var(--ink-soft); margin: 10px 0; }

/* footer */
.footer {
  border-top: 1px solid var(--line); padding: 28px 0;
  text-align: center; font-size: 13px; color: var(--ink-faint);
}

@media (max-width: 760px) {
  .results-grid { grid-template-columns: 1fr; }
  .hero { padding-top: 48px; }
  .nav-links { gap: 0; }
  .nav-link { padding: 8px 10px; }
  .panel-foot { flex-direction: column; align-items: stretch; }
  .btn-group .btn { flex: 1; justify-content: center; }
}
`;

/* ─────────────────────────── data/demoReport.ts ─────────────────────────── */

const DEMO_REPORT = `ROUTINE EEG REPORT — SAMPLE (fictional, for education)

INDICATION: 24-year-old with episodes of brief staring and unresponsiveness. Rule out seizure activity.

TECHNIQUE: Digital EEG recorded with 21 electrodes placed per the International 10-20 System. Recording obtained during wakefulness and drowsiness. Hyperventilation and intermittent photic stimulation were performed.

BACKGROUND: The waking background is symmetric and well organized, with a 9-10 Hz posterior dominant rhythm that attenuates appropriately with eye opening. Normal anterior-to-posterior gradient. During drowsiness, expected slowing of the background with attenuation of the posterior dominant rhythm.

EPILEPTIFORM ACTIVITY: Occasional left anterior temporal sharp waves with phase reversal at F7/T3, seen predominantly during drowsiness.

HYPERVENTILATION: Produced mild symmetric background slowing; no epileptiform discharges elicited.

PHOTIC STIMULATION: Symmetric photic driving at intermediate flash frequencies. No photoparoxysmal response.

IMPRESSION: Mildly abnormal EEG due to occasional left anterior temporal epileptiform discharges. This finding indicates focal cortical irritability and, in the appropriate clinical context, may support a diagnosis of focal epilepsy of left temporal origin. Clinical correlation is recommended.`;

/* ─────────────────────────── lib/prompt.ts + api ────────────────────────── */

const buildPrompt = (report) => `You are assisting an educational neurotechnology tool that explains EEG reports to students and curious patients. Analyze the EEG report below.

Respond with ONLY a valid JSON object — no markdown fences, no preamble. Use accepted neurological terminology. Do not fabricate findings not present in the report. Keep every string concise.

Schema:
{
  "executiveSummary": "2-3 sentence plain-language overview of what the report describes",
  "keyFindings": [{ "finding": "short description", "significance": "normal" | "abnormal" | "nonspecific" }],
  "medicalTerms": [{ "term": "term from the report", "explanation": "one-sentence plain explanation" }],
  "studentNotes": ["2-4 concise teaching points a medical/neuroscience student should take away"],
  "patientFriendly": "3-4 sentences explaining the report in warm, simple language, ending by noting only their own doctor can interpret it for their situation"
}

Limits: max 5 keyFindings, max 5 medicalTerms, max 4 studentNotes.

EEG report:
"""
${report}
"""`;

async function analyzeReport(report) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    executiveSummary:
      "This sample EEG report describes a mildly abnormal EEG due to occasional left anterior temporal sharp waves. No electrographic seizures were recorded during the study.",

    keyFindings: [
      {
        finding: "The waking background is symmetric and well organized.",
        significance: "normal",
      },
      {
        finding: "A 9–10 Hz posterior dominant rhythm is present.",
        significance: "normal",
      },
      {
        finding: "Occasional left anterior temporal sharp waves are seen.",
        significance: "abnormal",
      },
      {
        finding: "No electrographic seizures were captured.",
        significance: "normal",
      },
    ],

    medicalTerms: [
      {
        term: "Posterior dominant rhythm",
        explanation:
          "A normal resting EEG rhythm seen over the back of the brain when a person is awake and relaxed.",
      },
      {
        term: "Sharp waves",
        explanation:
          "Brief EEG waveforms that may suggest increased seizure tendency when interpreted in the right clinical context.",
      },
      {
        term: "Phase reversal",
        explanation:
          "An EEG pattern that helps identify where an abnormal signal may be strongest.",
      },
      {
        term: "Focal cortical irritability",
        explanation:
          "A phrase suggesting that one area of the brain may be more likely to generate abnormal electrical activity.",
      },
    ],

    studentNotes: [
      "Left anterior temporal sharp waves may support focal temporal epileptiform activity.",
      "A normal posterior dominant rhythm suggests preserved background organization.",
      "No captured seizure does not fully exclude epilepsy.",
      "EEG findings must always be interpreted with the clinical history.",
    ],

    patientFriendly:
      "Most of the background brain activity in this sample EEG looks organized. The report also mentions sharp waves from the left temporal region, which can sometimes be linked with seizure tendency depending on the person's symptoms. No seizure was recorded during this EEG. A neurologist must interpret what this means for an individual patient.",
  };
}

/* ───────────────────────── components/EEGTrace.tsx ──────────────────────── */

/** Animated EEG-style trace — the app's signature visual, drawn once on load. */
function EEGTrace() {
  // A hand-shaped path resembling background rhythm with one sharp-wave transient.
  const d =
    "M0,40 L40,40 Q50,28 58,40 T78,40 Q88,30 96,40 T116,40 L150,40 Q160,26 168,40 T188,40 " +
    "L230,40 L248,8 L258,62 L268,40 L310,40 Q320,30 328,40 T348,40 Q358,28 366,40 T386,40 " +
    "L430,40 Q440,32 448,40 T468,40 L510,40 Q520,26 530,40 T550,40 Q560,30 568,40 T588,40 L640,40";
  return (
    <div className="trace-box" aria-hidden="true">
      <svg viewBox="0 0 640 80" width="100%" height="80">
        <path className="trace-path" d={d} />
      </svg>
    </div>
  );
}

/* ─────────────────────────── components/Card.tsx ────────────────────────── */

function Card({ icon: Icon, title, span, className = "", delay = 0, children }) {
  return (
    <section
      className={`card ${span ? "span-2" : ""} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="card-head">
        <div className="card-icon"><Icon size={19} /></div>
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function SkeletonCard({ span, lines = 4 }) {
  return (
    <div className={`card skeleton ${span ? "span-2" : ""}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="bar" style={{ width: `${90 - i * 14}%`, animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  );
}

/* ──────────────────────── components/ResultsGrid.tsx ────────────────────── */

const TAG_LABELS = { normal: "Normal", abnormal: "Abnormal", nonspecific: "Nonspecific" };

function ResultsGrid({ result }) {
  return (
    <div className="results-grid" aria-live="polite">
      <Card icon={ClipboardList} title="Executive Summary" span delay={0}>
        <p>{result.executiveSummary}</p>
      </Card>

      <Card icon={Activity} title="Key Findings" delay={80}>
        <ul>
          {result.keyFindings.map((f, i) => (
            <li key={i} className="finding">
              <span className={`tag tag-${f.significance || "nonspecific"}`}>
                {TAG_LABELS[f.significance] || "Nonspecific"}
              </span>
              <span className="txt">{f.finding}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card icon={BookOpen} title="Medical Terms Explained" delay={140}>
        <dl>
          {result.medicalTerms.map((t, i) => (
            <div key={i} className="term">
              <dt>{t.term}</dt>
              <dd>{t.explanation}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card icon={GraduationCap} title="Student Notes" delay={200}>
        <ul>
          {result.studentNotes.map((n, i) => (
            <li key={i} className="finding">
              <span className="channel-label" style={{ marginTop: 3 }}>{`N${i + 1}`}</span>
              <span className="txt">{n}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card icon={HeartHandshake} title="Patient-Friendly Explanation" delay={260}>
        <p>{result.patientFriendly}</p>
      </Card>

      {/* Static by design — safety copy should never depend on model output */}
      <Card icon={ShieldAlert} title="Disclaimer" span className="disclaimer" delay={320}>
        <p>
          This is an educational tool for learning about EEG terminology and report
          structure. It is not a medical device, does not provide a diagnosis, and its
          output is not clinical advice. AI-generated explanations may contain errors.
          Always rely on a qualified neurologist or your own physician to interpret any
          EEG report, and never make health decisions based on this tool.
        </p>
      </Card>
    </div>
  );
}

/* ───────────────────────────── pages/About.tsx ──────────────────────────── */

function AboutPage() {
  return (
    <div className="page">
      <span className="channel-label">About</span>
      <h2>Reading brainwaves, in plain language</h2>
      <p>
        EEG Report Explainer is an educational neurotechnology project. Paste the text of
        an electroencephalogram (EEG) report and the app uses a large language model to
        break it down: what was recorded, which findings matter, what the terminology
        means, and how the same information reads for a student versus a patient.
      </p>
      <h3>Who it's for</h3>
      <p>
        Medicine and neuroscience students learning to read reports, developers exploring
        AI in healthcare, and anyone curious about what phrases like "posterior dominant
        rhythm" actually describe.
      </p>
      <h3>How it works</h3>
      <p>
        The report text is sent to Claude with a structured prompt that requests a
        strict JSON analysis: a summary, tagged findings, term definitions, teaching
        points, and a plain-language explanation. Nothing is stored — the analysis lives
        only in your current session.
      </p>
      <h3>What it is not</h3>
      <p>
        It is not a diagnostic system and not a substitute for a neurologist. See the
        Disclaimer page for the full statement.
      </p>
    </div>
  );
}

/* ─────────────────────────── pages/Disclaimer.tsx ───────────────────────── */

function DisclaimerPage() {
  return (
    <div className="page">
      <span className="channel-label">Disclaimer</span>
      <h2>Educational use only</h2>
      <p>
        EEG Report Explainer is a software demonstration built for education and
        portfolio purposes. It is not a medical device and has not been evaluated,
        cleared, or approved by any regulatory body.
      </p>
      <h3>No medical advice</h3>
      <p>
        Output from this application is generated by an AI language model and may be
        incomplete, outdated, or incorrect. It does not constitute a diagnosis,
        treatment recommendation, or medical opinion of any kind.
      </p>
      <h3>Talk to a professional</h3>
      <p>
        Only a qualified clinician who knows your history can interpret an EEG report in
        your clinical context. If you have questions about a real report, bring them to
        your neurologist or physician.
      </p>
      <h3>Privacy note</h3>
      <p>
        Avoid pasting reports that contain personal identifying information. Remove
        names, dates of birth, and record numbers before analysis.
      </p>
    </div>
  );
}

/* ────────────────────────────────── App ─────────────────────────────────── */

export default function App() {
  const [view, setView] = useState("home");
  const [report, setReport] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const resultsRef = useRef(null);

  const handleAnalyze = async () => {
    if (!report.trim()) return;
    setStatus("loading");
    setResult(null);
    try {
      const parsed = await analyzeReport(report);
      setResult(parsed);
      setStatus("done");
    } catch (err) {
      console.error("Analysis failed:", err);
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status === "loading" && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [status]);

  const navigate = (v) => { setView(v); window.scrollTo({ top: 0 }); };

  return (
    <div className="eeg-app">
      <style>{STYLES}</style>

      <nav className="nav">
        <div className="wrap nav-inner">
          <button className="nav-brand" onClick={() => navigate("home")}>
            <Brain size={22} color="#1D5BF0" />
            EEG Report Explainer
          </button>
          <div className="nav-links">
            {["home", "about", "disclaimer"].map((v) => (
              <button
                key={v}
                className={`nav-link ${view === v ? "active" : ""}`}
                onClick={() => navigate(v)}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {view === "about" && <AboutPage />}
      {view === "disclaimer" && <DisclaimerPage />}

      {view === "home" && (
        <>
          <header className="hero wrap">
            <span className="channel-label">
              <Sparkles size={12} /> AI · Educational neurotech
            </span>
            <h1>
              Understand any <span className="accent">EEG report</span>
              <br />
              in plain language
            </h1>
            <p className="sub">
              Paste a report and get a structured breakdown — key findings, terminology,
              student notes, and a patient-friendly explanation.
            </p>
            <EEGTrace />
          </header>

          <main className="wrap">
            <div className="panel">
              <label htmlFor="report-input" className="channel-label">
                Report input
              </label>
              <textarea
                id="report-input"
                value={report}
                onChange={(e) => setReport(e.target.value)}
                placeholder="Paste the full text of an EEG report here… (remove any personal identifiers first)"
                spellCheck={false}
              />
              <div className="panel-foot">
                <span className="char-count">{report.length.toLocaleString()} chars</span>
                <div className="btn-group">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setReport(DEMO_REPORT)}
                    disabled={status === "loading"}
                  >
                    <FlaskConical size={16} /> Load Demo
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => { setReport(""); setResult(null); setStatus("idle"); }}
                    disabled={status === "loading" || (!report && !result)}
                  >
                    <X size={16} /> Clear
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleAnalyze}
                    disabled={status === "loading" || !report.trim()}
                  >
                    {status === "loading"
                      ? <><Loader2 size={16} className="spin" style={{ animation: "spin 1s linear infinite" }} /> Analyzing…</>
                      : <><Sparkles size={16} /> Analyze Report</>}
                  </button>
                </div>
              </div>
            </div>

            <section className="results" ref={resultsRef}>
              {status === "idle" && (
                <div className="empty">
                  <Activity size={32} />
                  <p>Your analysis will appear here. Load the demo report to see it in action.</p>
                </div>
              )}

              {status === "loading" && (
                <div className="results-grid">
                  <SkeletonCard span lines={3} />
                  <SkeletonCard lines={5} />
                  <SkeletonCard lines={5} />
                  <SkeletonCard lines={4} />
                  <SkeletonCard lines={4} />
                </div>
              )}

              {status === "error" && (
                <div className="error-box" role="alert">
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>
                    Analysis couldn't be completed. The report may be too long, or the
                    response wasn't in the expected format. Trim the report or try again.
                  </span>
                </div>
              )}

              {status === "done" && result && <ResultsGrid result={result} />}
            </section>
          </main>
        </>
      )}

      <footer className="footer">
        <div className="wrap">
          EEG Report Explainer · Educational project · Not a medical device
        </div>
      </footer>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
