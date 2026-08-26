# Recipe Search Engine

A fast, dependency-free recipe finder that works entirely in the browser. Search by dish name, main ingredient, category, or cuisine; open full instructions; and revisit recipes saved locally on the device.

**Live demo:** [aminmoji.github.io/RECIPE-SEARCH-ENGINE](https://aminmoji.github.io/RECIPE-SEARCH-ENGINE/)

## Features

- Recipe-name search
- Main-ingredient search
- Category and cuisine filters
- Adjustable result count
- Random recipe discovery
- Full ingredients, measures, and instructions
- Original-source and video links when available
- Recently viewed history stored in the browser
- Responsive layout and accessible native dialog
- Loading, empty, error, and offline-service states

## Technical approach

The project uses semantic HTML, modern CSS, and JavaScript modules without a framework or runtime dependency.

```text
index.html                 Discovery and search page
recently-viewed.html       Device-local recipe history
js/app.js                  UI state, safe DOM rendering, and interaction
js/recipe-api.js           API requests and response normalization
css/style.css              Responsive visual system
assets/logo.svg            Repository-native brand mark
tests/recipe-api.test.js   URL, ingredient, and normalization tests
```

Search results are normalized into one small application model before the UI receives them. Recipe text is added with DOM APIs and `textContent` rather than injected as HTML.

## Recipe data

Data and images come from [TheMealDB](https://www.themealdb.com/api.php). Its V1 educational endpoint uses the documented test key `1` in the URL, so this static GitHub Pages project does not expose a private credential.

The public API supports one main ingredient per filter request. Multi-ingredient filtering is therefore deliberately not presented as a feature.

## Run locally

JavaScript modules require an HTTP server rather than opening the HTML file directly:

```bash
git clone https://github.com/aminmoji/RECIPE-SEARCH-ENGINE.git
cd RECIPE-SEARCH-ENGINE
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Verify

Node.js 20 or newer is used only for development checks:

```bash
npm ci
npm run check
npm test
```

The deployed application itself has no npm dependencies and no build step.

## Privacy and security

- No account, password, analytics, or private API key
- Recently viewed recipes remain in `localStorage` on the current device
- External recipe text is rendered as text, not HTML
- External links are restricted to HTTP and HTTPS and open with `noopener`
- A Content Security Policy limits scripts, network requests, and images
- Stale searches are cancelled before a new request begins

## Project background

This project began as a 2023 boot-camp API exercise and was later rebuilt as a working static portfolio application with no credential setup required.

Recipe data and images are provided by TheMealDB. Application code is available under the [MIT License](LICENSE).
