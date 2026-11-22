import { useCallback, useEffect, useState } from "react";
import { BUYIN, CHIPS_PER_DOLLAR } from "./config.js";

const KEY = "blindsAreUp.rebuys";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function useRebuys(players) {
  const [saved] = useState(load);
  const [price, setPrice] = useState(saved.price || BUYIN / 2);
  const [rebuys, setRebuys] = useState(saved.rebuys || []); // list of dollar amounts

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ price, rebuys }));
  }, [price, rebuys]);

  const add = useCallback(() => setRebuys((r) => [...r, price]), [price]);
  const undo = useCallback(() => setRebuys((r) => r.slice(0, -1)), []);
  const clear = useCallback(() => setRebuys([]), []);

  const rebuyDollars = rebuys.reduce((a, b) => a + b, 0);
  const prizePool = players * BUYIN + rebuyDollars;

  return {
    price, setPrice, rebuys, add, undo, clear,
    rebuyDollars, prizePool,
    chipsInPlay: prizePool * CHIPS_PER_DOLLAR,
    chipsPerRebuy: price * CHIPS_PER_DOLLAR,
  };
}
