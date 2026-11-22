import { useCallback, useEffect, useRef, useState } from "react";
import { LEVELS } from "./config.js";
import { beep, ringBell } from "./audio.js";

const LAST = LEVELS.length - 1;
const KEY = "blindsAreUp";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function useBlindTimer() {
  const saved = useRef(load()).current;
  const [players, setPlayers] = useState(saved.players || 8);
  const [hours, setHoursState] = useState(saved.hours || 3);
  const levelMs = (hours * 3600000) / LEVELS.length;

  const [level, setLevel] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(levelMs); // used while paused
  const [now, setNow] = useState(Date.now());
  const [announce, setAnnounce] = useState(null); // { id, level } when blinds go up
  const endsAt = useRef(0); // epoch ms, used while running
  const lastBeep = useRef(-1);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ players, hours }));
  }, [players, hours]);

  // Wall-clock based tick, so a throttled tab doesn't lose time.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  const left = running ? Math.max(0, endsAt.current - now) : remaining;

  const goTo = useCallback(
    (i, withAnnounce) => {
      const next = Math.max(0, Math.min(LAST, i));
      setLevel(next);
      setRemaining(levelMs);
      endsAt.current = Date.now() + levelMs;
      lastBeep.current = -1;
      if (withAnnounce) {
        ringBell();
        setAnnounce({ id: Date.now(), level: next });
      }
    },
    [levelMs]
  );

  // Level rollover and last-seconds beeps.
  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      if (level >= LAST) {
        setRunning(false);
        setRemaining(0);
      } else {
        goTo(level + 1, true);
      }
      return;
    }
    const sec = Math.ceil(left / 1000);
    if (sec !== lastBeep.current) {
      lastBeep.current = sec;
      if (sec <= 5) beep(sec === 1 ? 1200 : 880);
    }
  }, [now, running, left, level, goTo]);

  const toggle = useCallback(() => {
    if (running) {
      setRemaining(Math.max(0, endsAt.current - Date.now()));
      setRunning(false);
    } else {
      endsAt.current = Date.now() + remaining;
      setRunning(true);
      beep(660, 0.15);
    }
  }, [running, remaining]);

  const next = useCallback(() => goTo(level + 1, true), [goTo, level]);
  const prev = useCallback(() => goTo(level - 1, false), [goTo, level]);

  const reset = useCallback(() => {
    if (!window.confirm("Reset the game back to Level 1? Rebuys will be cleared too.")) return false;
    setRunning(false);
    setLevel(0);
    setRemaining(levelMs);
    setAnnounce(null);
    return true;
  }, [levelMs]);

  const setHours = useCallback((h) => {
    const ms = (h * 3600000) / LEVELS.length;
    setHoursState(h);
    setRemaining(ms);
    endsAt.current = Date.now() + ms;
  }, []);

  return {
    players, setPlayers, hours, setHours,
    level, running, left, levelMs, announce,
    elapsed: level * levelMs + (levelMs - left),
    toggle, next, prev, reset,
  };
}
