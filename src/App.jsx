import { useEffect, useState } from "react";
import {
  CHIPS, HALF_REBUY_CHIPS, HOUR_OPTIONS, LEVELS, PLAYER_OPTIONS, REBUY_OPTIONS, START_CHIPS, STACK, WARN_SECONDS,
} from "./config.js";
import { fmtClock, fmtHM, num } from "./format.js";
import { useBlindTimer } from "./useBlindTimer.js";
import { useRebuys } from "./useRebuys.js";
import Confetti from "./components/Confetti.jsx";
import HandsModal from "./components/HandsModal.jsx";
import RulesModal from "./components/RulesModal.jsx";

const LAST = LEVELS.length - 1;
const RING = 2 * Math.PI * 46;

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => {});
}

export default function App() {
  const t = useBlindTimer();
  const rb = useRebuys(t.players);
  const [modal, setModal] = useState(null); // "hands" | "rules" | null
  const [showUp, setShowUp] = useState(false);

  const [sb, bb] = LEVELS[t.level];
  const [nsb, nbb] = LEVELS[Math.min(t.level + 1, LAST)];
  const isLast = t.level === LAST;
  const sec = Math.ceil(t.left / 1000);
  const warn = t.running && sec <= WARN_SECONDS && sec > 0;

  // Banner + page flash when the blinds go up.
  useEffect(() => {
    if (!t.announce) return;
    setShowUp(true);
    const id = setTimeout(() => setShowUp(false), 4500);
    return () => clearTimeout(id);
  }, [t.announce]);

  useEffect(() => {
    const cls = document.body.classList;
    cls.toggle("warn", warn);
    cls.toggle("paused", !t.running);
  }, [warn, t.running]);

  useEffect(() => {
    if (!t.announce) return;
    const cls = document.body.classList;
    cls.remove("flash");
    void document.body.offsetWidth; // restart animation
    cls.add("flash");
  }, [t.announce]);

  const resetAll = () => { if (t.reset()) rb.clear(); };

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "SELECT") return;
      if (e.key === "Escape") return setModal(null);
      if (modal) return;
      if (e.code === "Space") { e.preventDefault(); t.toggle(); }
      else if (e.key === "ArrowRight") t.next();
      else if (e.key === "ArrowLeft") t.prev();
      else if (e.key === "r" || e.key === "R") resetAll();
      else if (e.key === "h" || e.key === "H") setModal("hands");
      else if (e.key === "?" || e.key === "/") setModal("rules");
      else if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, t, rb]);

  const startLabel = t.running
    ? "❚❚ Pause"
    : `▶ ${t.elapsed > 0 ? "Resume" : "Start"}`;
  const status = t.running ? (isLast ? "Final level" : "Blinds up in") : "Paused";

  return (
    <div id="app">
      <header>
        <div className="settings">
          Players{" "}
          <select value={t.players} onChange={(e) => { t.setPlayers(+e.target.value); e.target.blur(); }}>
            {PLAYER_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {" "}Game length{" "}
          <select value={t.hours} onChange={(e) => { t.setHours(+e.target.value); e.target.blur(); }}>
            {HOUR_OPTIONS.map((h) => <option key={h} value={h}>{h} hours</option>)}
          </select>
          {" "}
          <span>{t.levelMs / 60000} min/level</span>
        </div>
        <div className="level">Level {t.level + 1} of {LEVELS.length}</div>
        <div>Starting stack {num(STACK)} | Chips in play {num(rb.chipsInPlay)}</div>
      </header>

      <main>
        <div className="blindgroup">
          <div className="blindbox current"><div className="label">Small Blind</div><div className="val">{num(sb)}</div></div>
          <div className="blindbox current"><div className="label">Big Blind</div><div className="val">{num(bb)}</div></div>
        </div>

        <div className="clock">
          <div className="ring">
            <svg viewBox="0 0 100 100">
              <circle className="bg" cx="50" cy="50" r="46" />
              <circle
                className="fg" cx="50" cy="50" r="46"
                style={{ strokeDasharray: RING, strokeDashoffset: RING * (1 - t.left / t.levelMs) }}
              />
            </svg>
            <div className="time">
              <div id="clock">{fmtClock(t.left)}</div>
              <div id="status">{status}</div>
            </div>
          </div>
        </div>

        <div className="blindgroup next">
          <div className="blindbox next"><div className="label">Next Small Blind</div><div className="val">{isLast ? "—" : num(nsb)}</div></div>
          <div className="blindbox next"><div className="label">Next Big Blind</div><div className="val">{isLast ? "—" : num(nbb)}</div></div>
        </div>
      </main>

      <div>
        <div className="elapsed">
          Elapsed {fmtHM(t.elapsed)} | Planned {fmtHM(t.hours * 3600000)}
        </div>
        <div className="chips">
          {CHIPS.map(([name, value, color]) => (
            <div className="chip" key={name}>
              <i style={{ "--c": color }} />{name} = {num(value)}
            </div>
          ))}
          <div className="chip" style={{ opacity: 0.7 }}>
            | Start: {Object.entries(START_CHIPS).map(([k, v]) => `${v} ${k}`).join(", ")}
          </div>
          <div className="chip" style={{ opacity: 0.7 }}>
            | Half rebuy: {Object.entries(HALF_REBUY_CHIPS).map(([k, v]) => `${v} ${k}`).join(", ")}
          </div>
        </div>
      </div>

      <div className="rebuys">
        <span className="rb-title">Rebuys</span>
        <div className="seg">
          {REBUY_OPTIONS.map((p) => (
            <button key={p} className={rb.price === p ? "on" : ""} onClick={() => rb.setPrice(p)}>
              ${p}{p === REBUY_OPTIONS[0] ? " (half)" : " (full)"}
            </button>
          ))}
        </div>
        <button onClick={rb.add}>+ Rebuy ${rb.price} ({num(rb.chipsPerRebuy)} chips)</button>
        <button onClick={rb.undo} disabled={!rb.rebuys.length}>Undo</button>
        <span>
          {rb.rebuys.length} rebuy{rb.rebuys.length === 1 ? "" : "s"} (${rb.rebuyDollars})
          {" | "}Prize pool <b>${rb.prizePool}</b>
        </span>
      </div>

      <div className="controls">
        <button onClick={t.prev} title="Left arrow">◀◀ Prev Blind</button>
        <button className="primary" onClick={t.toggle} title="Space">{startLabel}</button>
        <button onClick={t.next} title="Right arrow">Next Blind ▶▶</button>
        <button className="danger" onClick={resetAll} title="R">↻ Reset</button>
        <button onClick={() => setModal("hands")} title="H">♠ Winning Hands</button>
        <button onClick={() => setModal("rules")} title="?">📖 Rules</button>
        <button onClick={toggleFullscreen} title="F">⛶ Fullscreen</button>
      </div>

      {showUp && (
        <div id="up" className="show">
          <h1>BLINDS ARE UP!</h1>
          <p>New blinds: {num(sb)} / {num(bb)}</p>
        </div>
      )}
      <Confetti trigger={t.announce?.id} />
      <HandsModal open={modal === "hands"} onClose={() => setModal(null)} />
      <RulesModal open={modal === "rules"} onClose={() => setModal(null)} />
    </div>
  );
}
