# Smart Order

Offline-first PWA. No accounts, no backend, no database. Drop the folder on Netlify and it's live.

## Updating the menus

You only ever touch two files.

1. Edit `data.json`.
2. Change `version` in `data.json` to today's date, e.g. `2026-11-04`.
3. Change `version` in `version.json` to the exact same string.

That's it. Next time anyone opens the app with a connection, it fetches `version.json`
(under 100 bytes), sees a new version, pulls the new `data.json`, and shows a
"Menus updated" toast. Nobody has to reinstall anything.

If the two versions don't match, the app re-downloads on every launch. If you
forget to bump them, nobody ever gets the update. Keep them in sync.

## Adding a chain

Copy an existing block in `chains` and fill it in:

```json
{
  "id": "unique-slug",
  "name": "Display Name",
  "verified": false,
  "tips": ["Chain-specific advice."],
  "addons": [{ "name": "Fries, medium", "cal": 420, "sodium_mg": 260, "note": "optional" }],
  "items": [{
    "name": "Item Name",
    "cat": "Sandwiches",
    "note": "optional description",
    "cal": 390, "protein_g": 28, "net_carbs_g": 41,
    "fat_g": 12, "sat_fat_g": 2, "sodium_mg": 770, "sugar_g": 10,
    "mods": [
      { "label": "No bun", "delta": { "cal": -160, "net_carbs_g": -35, "sodium_mg": -230 } }
    ]
  }]
}
```

`delta` values are **changes**, not new totals. Negative numbers subtract. Only include
the fields that actually move.

Set `verified: true` once you've checked a chain's numbers against its official
nutrition page. Until then the app shows a "Seed data" badge on that chain — which is
the honest thing to display, and it keeps you from forgetting which ones you've done.

## Thresholds

Edit `thresholds` in `data.json` to change what counts as high protein, low sodium, etc.
The app reads them at runtime and rewrites the rule text under the filter chips, so
the UI never disagrees with the data.

## Deploy

Netlify, drag-and-drop or GitHub. Must be HTTPS for the service worker to register.
After deploying a code change (not a data change), bump `CACHE` in `sw.js` from
`smart-order-v1` to `-v2` so old shells get evicted.

## Files

| File | What it is |
|---|---|
| `data.json` | The dataset. The only file you edit regularly. |
| `version.json` | Tiny sync beacon. Must match `data.json`'s version. |
| `index.html` | Whole app — markup, styles, logic. |
| `sw.js` | Service worker. Offline caching. |
| `manifest.json` | Install metadata. |
| `icon-192.png` / `icon-512.png` | Home screen icons. Replace with real branding. |

## Data sources — check `source` and `verified` on every chain

| Tag | Meaning | Trust |
|---|---|---|
| `verified: true` + `source: healthyfastfood.org` | Full macros, checked item-by-item against the chain's published nutrition info | Good |
| `source: steady-import` | Protein and calories only, from the Steady app. Everything else `null` | Partial |
| no source (Chipotle, Whataburger) | Hand-entered placeholder numbers | **Do not trust — replace** |

The seed rows for Chipotle and Whataburger were placeholders and one has already been
proven wrong (the Chick-fil-A seed said 390 cal for the grilled chicken sandwich; it's
320). Replace them from healthyfastfood.org the same way the verified chains were built.

## Missing numbers are `null`, never `0`

Eight chains were imported from Steady, which only stored protein and calories.
Their `net_carbs_g`, `fat_g`, `sat_fat_g`, `sodium_mg`, and `sugar_g` are all `null`.

The app treats `null` as **unknown**, not zero. Those items don't pass or fail the
low-sodium and low-carb filters — they're grouped separately under "can't be checked
yet." If you ever write `0` for a number you don't actually have, the item will silently
pass the low-sodium filter and the app will tell someone a 1,700mg sandwich is fine.

Filling those nulls in from each chain's published nutrition page is the remaining work.
Set `verified: true` on a chain once its numbers are checked.

Imported chains carry `"source": "steady-import"` so you can tell them apart.

## Rules for writing mods

The app stacks mods automatically to answer "can this item fit if I change it?"
That only works if each mod is **independently combinable**. Two rules:

1. **One mod = one change to one order.** Never write a mod that swaps the item for a
   different item ("Order the Jr. instead"). It double-counts the moment the app stacks
   it with "No cheese." If two items are alternatives, make them two items.
2. **List the biggest lever first.** The app applies helpful mods in file order and stops
   as soon as the item clears the goal, so putting "No bun" above "No mayo" gets you the
   shortest honest suggestion instead of a pile of small ones.

Cross-check your work by loading the app and switching through all four goals. Anything
that reads as an absurd instruction is a data bug, not a code bug.
