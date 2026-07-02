# VikipediAi

Static website for AI competition and value-chain mapping.

## Structure

- `index.html`: bilingual navigation landing page with version badge
- `map.html`: interactive map page (data-driven)
- `data/graph.json`: maintainable node/edge dataset
- `data/graph.schema.json`: schema definition for graph data validation
- `products.html`: AI product capability and case library page
- `data/products.json`: product profiles, scenarios, and trend dataset
- `.github/workflows/pages.yml`: GitHub Pages deployment

## Features

- Chinese/English switch
- Relationship filters:
	- all
	- competition only
	- dependency only
	- China-US direct matchup
- Highlight modes:
	- investor view
	- enterprise procurement view
- One-click 16:9 screenshot export for slide decks
- Clean export mode: hide toolbar/notes before exporting
- Node detail modal: click any node to view positioning, competitors, and dependencies
- Runtime schema validation for `data/graph.json`

## Local preview

Open `index.html` in browser.
