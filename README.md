# Smart Order V2

Smart Order is an offline-first PWA that helps people make more informed restaurant orders. V2 treats restaurant entries as **curated Smart Picks**, not complete menu coverage, and makes nutrition data quality visible in the product.

## What changed in V2

- Receipt / order-ticket visual system throughout the app.
- 27 restaurant chains and 196 curated Smart Picks.
- Restaurant-level **Data Receipt** with source status and nutrition-field coverage.
- Four data states: `verified`, `partial`, `limited`, and `recheck`.
- Goal results grouped into **Best Bets**, **Make It Smarter**, **Can't Verify Yet**, and **Other Smart Picks**.
- Missing nutrition remains `null`; it never silently passes a filter.
- `My Order` lets users add customized items and see whole-order nutrition totals.
- More accurate empty states: the app no longer claims that nothing on a restaurant's entire menu fits when only curated picks have been analyzed.

## Deploy

This is still a static PWA. Upload the folder to Netlify or deploy it from GitHub. HTTPS is required for the service worker.

The service-worker cache is currently:

```js
smart-order-v3-receipt
```

Bump that cache name after future code-shell changes.

## Updating nutrition data

For ordinary nutrition updates, edit:

1. `data.json`
2. `version.json`

Set the exact same `version` in both files. The app checks `version.json`, refreshes `data.json` when the version changes, and continues to work offline after caching.

## V2 restaurant schema

Each chain keeps the existing `items`, `mods`, `tips`, and `addons`, and now includes `data_status`:

```json
{
  "id": "example-chain",
  "name": "Example Chain",
  "verified": false,
  "source": "official-example-2026-partial",
  "data_status": {
    "state": "partial",
    "source_type": "official",
    "source_key": "official-example-2026-partial",
    "source_note": "Official nutrition source checked August 2026; full audit pending.",
    "last_checked": "2026-08-29",
    "nutrition_date": "2026",
    "coverage": "curated",
    "coverage_note": "Curated Smart Picks — not a complete restaurant menu.",
    "items_analyzed": 12,
    "field_counts": {
      "calories": 12,
      "protein": 12,
      "net_carbs": 9,
      "fat": 9,
      "sat_fat": 9,
      "sodium": 9,
      "sugar": 9
    },
    "field_coverage_pct": {
      "calories": 100,
      "protein": 100,
      "net_carbs": 75,
      "fat": 75,
      "sat_fat": 75,
      "sodium": 75,
      "sugar": 75
    },
    "confidence": "medium",
    "freshness": "current_or_partial",
    "summary": "Official nutrition data was used, but this Smart Pick set has not been fully re-audited field by field."
  }
}
```

### Data status meanings

- `verified` — every Smart Pick listed for the restaurant has been checked against a current official source and the required macro fields are populated.
- `partial` — official information is involved, but the Smart Pick set is not fully audited or some fields remain incomplete.
- `limited` — only a subset of nutrition fields is currently trustworthy enough to use.
- `recheck` — information is old, hand-entered, unverified, or otherwise needs a fresh official check.

The legacy `verified` boolean is preserved for compatibility, but the UI uses `data_status` as the richer source of truth.

## Missing nutrition values

Unknown values must be `null`, never `0`.

For example:

```json
"sodium_mg": null
```

means Smart Order cannot evaluate that item for the Lower Sodium goal. The UI places it under **Can't Verify Yet** and explains why.

## Smart Picks, not full menus

Do not describe `items` as the restaurant's complete menu unless you actually ingest and maintain the complete menu.

The intended content mix for a strong restaurant set is roughly 15–25 useful Smart Picks covering:

- best protein-forward orders
- lower-calorie choices
- lower-carb choices
- popular/default orders for comparison
- breakfast where relevant
- useful sides
- items that become stronger through realistic modifications
- a few popular high-calorie/high-sodium comparisons

## Mods

`mods[].delta` values are changes from the base item, not replacement totals.

```json
{
  "label": "No bun",
  "delta": {
    "cal": -160,
    "net_carbs_g": -35,
    "sodium_mg": -230
  }
}
```

Keep each mod independently combinable. The app can automatically suggest helpful changes and also lets the user toggle them manually before adding the customized item to My Order.

## Current dataset

V2 ships with 27 chains / 196 Smart Picks. The next priority should be **depth and verification**, not adding more restaurant names: strengthen the largest national chains to roughly 15–25 well-sourced Smart Picks each.
