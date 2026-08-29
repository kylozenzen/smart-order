# Smart Order V2 — Receipt / Trust Pass

## Product shift

Smart Order now presents itself as an **order advisor** built from curated Smart Picks rather than implying that each restaurant entry is a complete menu database.

## UX changes

- Receipt/order-ticket visual system.
- Home screen clearly states restaurant count, Smart Picks analyzed, and the curated-coverage promise.
- Restaurant cards say **Smart Picks analyzed** instead of menu-item counts.
- Restaurant pages include a **Data Receipt** showing:
  - verification state
  - explanation of why that state applies
  - calories/protein/net-carb/sodium field coverage percentages
  - source note
  - last checked/source date when known
- Results are grouped into:
  - Best Bets
  - Make It Smarter
  - Can't Verify Yet
  - Other Smart Picks
- Empty states no longer claim the entire restaurant has no qualifying order when Smart Order only has curated coverage.
- Search copy now reflects the Smart Pick model.

## My Order

- Add any Smart Pick to a persistent local order.
- Selected modifications are captured with the item.
- Adding the same item again updates its saved configuration.
- Whole-order calories, protein, net carbs, and sodium are totaled when all required values are known.
- The combined order is evaluated against the currently selected goal when the data supports it.

## Data model

- Dataset version: `2026.08.29-v2-receipt`.
- 27 chains / 196 Smart Picks.
- Added `schema_version: 2`.
- Added root `methodology` notes.
- Added `data_status` to every restaurant with:
  - state
  - source type/key/note
  - freshness/check date
  - curated coverage note
  - items analyzed
  - field counts
  - field coverage percentages
  - confidence
  - plain-language explanation
- Existing `verified` remains for backwards compatibility.

## Current trust-state counts

- 8 verified
- 10 partial
- 5 limited
- 4 needs recheck

## PWA

- Service worker cache bumped to `smart-order-v3-receipt`.
- Manifest description updated.
- `data.json` and `version.json` versions match.

## Recommended next data pass

Prioritize depth before adding more chains. Fully audit and expand the largest national restaurants to roughly 15–25 useful Smart Picks each, starting with Taco Bell, Subway, Burger King, Panda Express, Starbucks, Five Guys, Chipotle, Whataburger, McDonald's, Wendy's, Raising Cane's, CAVA, Popeyes, Panera, Dunkin', and Domino's.
