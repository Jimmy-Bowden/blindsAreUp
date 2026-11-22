// 12 levels. Level length = game length / 12:
// a 2h game is 10 min/level, 3h is 15, 4h is 20.
export const LEVELS = [
  [25, 50], [50, 100], [100, 200], [150, 300], [200, 400],
  [300, 600], [400, 800], [500, 1000], [750, 1500], [1000, 2000], [1500, 3000], [2000, 4000],
];

export const STACK = 10000; // starting chips for a $20 buy-in
export const BUYIN = 20;
export const CHIPS_PER_DOLLAR = STACK / BUYIN; // 500, same for buy-ins and rebuys
export const REBUY_OPTIONS = [BUYIN / 2, BUYIN]; // half or full buy-in
export const WARN_SECONDS = 10;
export const PLAYER_OPTIONS = [6, 7, 8, 9, 10, 11, 12];
export const HOUR_OPTIONS = [2, 2.5, 3, 3.5, 4];

// [name, value, css color]
// Ordered low to high. Inventory: ~400 red, ~300 blue, ~180 green,
// ~150 black, ~100 yellow. Brown (~20) is not used.
export const CHIPS = [
  ["red", 25, "#d93636"], ["blue", 50, "#2f6fdb"], ["green", 100, "#1f9d55"],
  ["black", 500, "#222"], ["yellow", 1000, "#e8c21a"],
];
// 10,000 total, 51 chips per player. 12 players use 240 red, 120 blue,
// 120 green, 72 black, 60 yellow, leaving the rest for rebuys.
export const START_CHIPS = { red: 20, blue: 10, green: 10, black: 6, yellow: 5 };
// Half rebuy (5,000) suggested breakdown.
export const HALF_REBUY_CHIPS = { red: 10, blue: 5, green: 5, black: 2, yellow: 3 };

export const HANDS = [
  ["Royal Flush", "A K Q J 10 of the same suit", "A♠ K♠ Q♠ J♠ 10♠"],
  ["Straight Flush", "Five cards in sequence, same suit", "9♥ 8♥ 7♥ 6♥ 5♥"],
  ["Four of a Kind", "Four cards of the same rank", "Q♠ Q♥ Q♦ Q♣ 3♠"],
  ["Full House", "Three of a kind plus a pair", "J♠ J♥ J♦ 4♣ 4♠"],
  ["Flush", "Five cards of the same suit, not in sequence", "A♦ 10♦ 8♦ 5♦ 2♦"],
  ["Straight", "Five cards in sequence, mixed suits", "8♣ 7♥ 6♠ 5♦ 4♣"],
  ["Three of a Kind", "Three cards of the same rank", "7♠ 7♥ 7♦ K♣ 2♠"],
  ["Two Pair", "Two different pairs", "A♠ A♦ 9♣ 9♥ 5♠"],
  ["One Pair", "Two cards of the same rank", "10♠ 10♦ A♣ 7♥ 3♠"],
  ["High Card", "None of the above; the highest card plays", "A♠ J♦ 8♣ 6♥ 3♠"],
];
