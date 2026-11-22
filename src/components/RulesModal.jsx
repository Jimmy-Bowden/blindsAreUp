import Modal from "./Modal.jsx";

export default function RulesModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Texas Hold 'Em Rules">
      <ol>
        <li><b>Blinds.</b> The dealer button moves left each hand. The player left of the button posts the small blind, the next player posts the big blind.</li>
        <li><b>Deal.</b> Each player gets two private cards (hole cards).</li>
        <li><b>Pre-flop betting.</b> Starts with the player left of the big blind. Options: fold, call the big blind, or raise.</li>
        <li><b>Flop.</b> Three community cards are dealt face up. Betting starts with the first active player left of the button.</li>
        <li><b>Turn.</b> A fourth community card is dealt, followed by another round of betting.</li>
        <li><b>River.</b> A fifth community card is dealt, followed by the final round of betting.</li>
        <li><b>Showdown.</b> Remaining players reveal their cards. The best five-card hand, made from any combination of the seven available cards (two hole cards plus five community cards), wins the pot. Ties split the pot.</li>
      </ol>
      <p><b>Betting actions:</b> Check (pass, if no bet), Bet, Call (match), Raise (increase), Fold (give up the hand), All-in (bet every chip).</p>
      <p><b>Minimum raise:</b> at least the size of the previous bet or raise in that round.</p>
      <p><b>Winning the game:</b> Play until one player has all the chips. Blinds go up on the timer, so be ready when you hear the bell.</p>
    </Modal>
  );
}
