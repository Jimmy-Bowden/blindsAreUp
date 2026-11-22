import { test, expect } from "@playwright/test";

// Fake time so we can fast-forward minutes instantly.
test.beforeEach(async ({ page }) => {
  await page.clock.install();
  page.on("dialog", (d) => d.accept()); // Reset confirmation
  await page.goto("/");
});

const clock = (page) => page.locator("#clock");
const current = (page) => page.locator(".current .val");
const next = (page) => page.locator(".next .val");
const level = (page) => page.locator("header .level");
const hoursSelect = (page) => page.locator("select").nth(1);
const playersSelect = (page) => page.locator("select").nth(0);
const btn = (page, name) => page.getByRole("button", { name });

async function advance(page, ms) {
  await page.clock.fastForward(ms);
  await page.clock.runFor(500); // let the 200ms tick render
}

test("initial state: level 1, 25/50, next 50/100, 3 hour default", async ({ page }) => {
  await expect(level(page)).toHaveText("Level 1 of 12");
  await expect(current(page)).toHaveText(["25", "50"]);
  await expect(next(page)).toHaveText(["50", "100"]);
  await expect(clock(page)).toHaveText("15:00");
  await expect(page.locator("#status")).toHaveText("Paused");
});

test("start counts down, pause holds the time", async ({ page }) => {
  await btn(page, /Start/).click();
  await advance(page, 5000);
  await expect(clock(page)).toHaveText("14:54");
  await btn(page, /Pause/).click();
  const frozen = await clock(page).textContent();
  await advance(page, 30000);
  await expect(clock(page)).toHaveText(frozen);
  await expect(btn(page, /Resume/)).toBeVisible();
});

test("next and previous blind update blinds and reset the level clock", async ({ page }) => {
  await btn(page, /Next Blind/).click();
  await expect(level(page)).toHaveText("Level 2 of 12");
  await expect(current(page)).toHaveText(["50", "100"]);
  await expect(next(page)).toHaveText(["100", "200"]);
  await btn(page, /Prev Blind/).click();
  await expect(level(page)).toHaveText("Level 1 of 12");
  await expect(clock(page)).toHaveText("15:00");
});

test("previous blind does nothing on level 1", async ({ page }) => {
  await btn(page, /Prev Blind/).click();
  await expect(level(page)).toHaveText("Level 1 of 12");
});

test("blinds go up automatically and show the banner", async ({ page }) => {
  await hoursSelect(page).selectOption("2"); // 10 min per level
  await expect(clock(page)).toHaveText("10:00");
  await btn(page, /Start/).click();
  await advance(page, 10 * 60 * 1000);
  await expect(level(page)).toHaveText("Level 2 of 12");
  await expect(page.getByText("BLINDS ARE UP!")).toBeVisible();
  await expect(page.getByText("New blinds: 50 / 100")).toBeVisible();
  await advance(page, 5000);
  await expect(page.getByText("BLINDS ARE UP!")).toBeHidden();
});

test("final level shows no next blinds and stops at zero", async ({ page }) => {
  for (let i = 0; i < 11; i++) await btn(page, /Next Blind/).click();
  await expect(level(page)).toHaveText("Level 12 of 12");
  await expect(current(page)).toHaveText(["2,000", "4,000"]);
  await expect(next(page)).toHaveText(["—", "—"]);
  await btn(page, /Next Blind/).click();
  await expect(level(page)).toHaveText("Level 12 of 12");
  await btn(page, /Start|Resume/).click();
  await advance(page, 16 * 60 * 1000);
  await expect(clock(page)).toHaveText("00:00");
  await expect(btn(page, /Resume|Start/)).toBeVisible();
});

test("chip legend shows five colors and no brown", async ({ page }) => {
  await expect(page.locator(".chips .chip i")).toHaveCount(5);
  await expect(page.getByText("brown")).toHaveCount(0);
  await expect(page.getByText("Start: 20 red, 10 blue, 10 green, 6 black, 5 yellow")).toBeVisible();
});

test("game length sets level duration", async ({ page }) => {
  for (const [h, t] of [["2", "10:00"], ["4", "20:00"], ["3", "15:00"]]) {
    await hoursSelect(page).selectOption(h);
    await expect(clock(page)).toHaveText(t);
  }
});

test("reset returns to level 1 and clears rebuys", async ({ page }) => {
  await btn(page, /\+ Rebuy/).click();
  await btn(page, /Next Blind/).click();
  await btn(page, /Reset/).click();
  await expect(level(page)).toHaveText("Level 1 of 12");
  await expect(clock(page)).toHaveText("15:00");
  await expect(page.getByText("0 rebuys ($0)")).toBeVisible();
});

test.describe("rebuys", () => {
  test("defaults: 8 players, $160 pool, 80,000 chips", async ({ page }) => {
    await expect(page.getByText("Prize pool $160")).toBeVisible();
    await expect(page.getByText("Chips in play 80,000")).toBeVisible();
  });

  test("half rebuy adds $10 and 5,000 chips", async ({ page }) => {
    await btn(page, /\+ Rebuy \$10 \(5,000 chips\)/).click();
    await expect(page.getByText("1 rebuy ($10)")).toBeVisible();
    await expect(page.getByText("Prize pool $170")).toBeVisible();
    await expect(page.getByText("Chips in play 85,000")).toBeVisible();
  });

  test("full rebuy adds $20 and 10,000 chips", async ({ page }) => {
    await btn(page, /\$20 \(full\)/).click();
    await btn(page, /\+ Rebuy \$20 \(10,000 chips\)/).click();
    await expect(page.getByText("Prize pool $180")).toBeVisible();
    await expect(page.getByText("Chips in play 90,000")).toBeVisible();
  });

  test("mixed rebuys and undo", async ({ page }) => {
    await btn(page, /\+ Rebuy/).click(); // $10
    await btn(page, /\$20 \(full\)/).click();
    await btn(page, /\+ Rebuy/).click(); // $20
    await expect(page.getByText("2 rebuys ($30)")).toBeVisible();
    await btn(page, "Undo").click();
    await expect(page.getByText("1 rebuy ($10)")).toBeVisible();
    await btn(page, "Undo").click();
    await expect(btn(page, "Undo")).toBeDisabled();
  });

  test("player count changes the pool", async ({ page }) => {
    await playersSelect(page).selectOption("12");
    await expect(page.getByText("Prize pool $240")).toBeVisible();
    await expect(page.getByText("Chips in play 120,000")).toBeVisible();
  });

  test("rebuys and settings survive a reload", async ({ page }) => {
    await playersSelect(page).selectOption("10");
    await btn(page, /\+ Rebuy/).click();
    await page.reload();
    await expect(playersSelect(page)).toHaveValue("10");
    await expect(page.getByText("1 rebuy ($10)")).toBeVisible();
  });
});

test.describe("modals", () => {
  test("winning hands opens, lists 10 hands, closes with button and Esc", async ({ page }) => {
    await btn(page, /Winning Hands/).click();
    await expect(page.getByRole("heading", { name: /Winning Hands/ })).toBeVisible();
    await expect(page.locator(".hand")).toHaveCount(10);
    await expect(page.locator(".hand").first()).toContainText("Royal Flush");
    await btn(page, /Close/).click();
    await expect(page.locator(".modal")).toHaveCount(0);
    await btn(page, /Winning Hands/).click();
    await page.keyboard.press("Escape");
    await expect(page.locator(".modal")).toHaveCount(0);
  });

  test("rules modal opens and closes", async ({ page }) => {
    await btn(page, /Rules/).click();
    await expect(page.getByRole("heading", { name: /Texas Hold/ })).toBeVisible();
    await expect(page.getByText("Showdown.")).toBeVisible();
    await btn(page, /Close/).click();
    await expect(page.locator(".modal")).toHaveCount(0);
  });

  test("shortcuts are ignored while a modal is open", async ({ page }) => {
    await btn(page, /Rules/).click();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await expect(level(page)).toHaveText("Level 1 of 12");
  });
});

test("keyboard shortcuts: space, arrows, h, ?", async ({ page }) => {
  await page.keyboard.press("Space");
  await advance(page, 3000);
  await expect(page.locator("#status")).toHaveText("Blinds up in");
  await page.keyboard.press("Space");
  await expect(page.locator("#status")).toHaveText("Paused");
  await page.keyboard.press("ArrowRight");
  await expect(level(page)).toHaveText("Level 2 of 12");
  await page.keyboard.press("ArrowLeft");
  await expect(level(page)).toHaveText("Level 1 of 12");
  await page.keyboard.press("h");
  await expect(page.locator(".hand")).toHaveCount(10);
  await page.keyboard.press("Escape");
  await page.keyboard.press("?");
  await expect(page.getByText("Showdown.")).toBeVisible();
});

test("last 10 seconds adds the warning state", async ({ page }) => {
  await btn(page, /Start/).click();
  await advance(page, 15 * 60 * 1000 - 8000);
  await expect(page.locator("body")).toHaveClass(/warn/);
});

test.describe("layout fits on common screens", () => {
  for (const [width, height] of [[1920, 1080], [1440, 900], [1280, 800], [1280, 720], [1024, 768]]) {
    test(`all controls visible at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      for (const name of [/Prev Blind/, /Start/, /Next Blind/, /Reset/, /Winning Hands/, /Rules/, /Fullscreen/, /\+ Rebuy/]) {
        await expect(btn(page, name)).toBeInViewport({ ratio: 1 });
      }
    });
  }
});
