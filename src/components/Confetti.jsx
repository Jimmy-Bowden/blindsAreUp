import { useEffect, useRef } from "react";
import { CHIPS } from "../config.js";

const COLORS = [...CHIPS.map((c) => c[2]), "#f5c542"];

export default function Confetti({ trigger }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const cv = ref.current;
    const cx = cv.getContext("2d");
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const ps = Array.from({ length: 160 }, () => ({
      x: Math.random() * cv.width,
      y: -20 - Math.random() * cv.height * 0.5,
      vx: Math.random() * 4 - 2,
      vy: 3 + Math.random() * 5,
      r: 6 + Math.random() * 10,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    const end = Date.now() + 4500;
    let raf;
    const frame = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        cx.beginPath();
        cx.fillStyle = p.c;
        cx.arc(p.x, p.y, p.r, 0, 7);
        cx.fill();
        cx.strokeStyle = "#fffc";
        cx.setLineDash([3, 3]);
        cx.lineWidth = 2;
        cx.stroke();
      }
      if (Date.now() < end) raf = requestAnimationFrame(frame);
      else cx.clearRect(0, 0, cv.width, cv.height);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [trigger]);

  return <canvas id="fx" ref={ref} />;
}
