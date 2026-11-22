import Modal from "./Modal.jsx";
import { HANDS } from "../config.js";

export default function HandsModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Winning Hands (best to worst)">
      {HANDS.map(([name, desc, example], i) => (
        <div className="hand" key={name}>
          <div className="rank">{i + 1}</div>
          <div>
            <b>{name}</b>
            <span className="d">{desc}</span>
            <div className="ex">
              {example.split(" ").map((c, j) => (
                <span key={j} className={/[♥♦]/.test(c) ? "r" : ""}>{c} </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </Modal>
  );
}
