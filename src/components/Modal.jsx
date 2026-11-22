export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="box">
        <button className="close" onClick={onClose}>Close (Esc)</button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
