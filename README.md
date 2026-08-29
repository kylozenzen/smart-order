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
