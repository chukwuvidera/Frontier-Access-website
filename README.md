# Frontier Access — website

One-page website for **Frontier Access** (frontieraccess.org), a frontier-markets advisory and development firm working across Africa, Latin America and Southeast Asia.

**Live preview:** https://chukwuvidera.github.io/Frontier-Access-website/

## Files

| File | Purpose |
|---|---|
| `index.html` | Page markup and all copy |
| `styles.css` | Brand palette (navy `#064268`, rust `#AB4524`, gold `#E3AC2E`), layout, responsive rules, animations |
| `main.js` | Hero contour-line canvas, scroll reveals, expandable "What we do" rows, sticky "How we work" steps, counters, partner marquee, header and mobile menu |
| `assets/work/` | Image for the Our Work project card |
| `assets/partners/` | Partner logos used in the Partners & collaborators strip |
| `assets/logo/` | Official logo files (PNG originals), vector SVG versions, favicon and touch icon |
| `preview/` | Full-page desktop and mobile screenshots |

No build step: it is plain HTML, CSS and JavaScript. Open `index.html` in a browser to view it locally. Fonts (Poppins, Inter) load from Google Fonts.

## Logo files

`assets/logo/` holds the two supplied PNGs and SVG versions traced from them, used across the site:

- `frontier-access-logo.svg`: full-colour logo for light backgrounds
- `frontier-access-logo-reversed.svg`: for dark backgrounds (white wordmark; the navy bar becomes white so it stays visible)
- `frontier-access-mark.svg` / `frontier-access-mark-reversed.svg`: the symbol on its own

In `index.html` the logo is inlined once as `<symbol id="fa-logo">` / `<symbol id="fa-mark">`, so the header can switch between the reversed version (over the dark hero) and full colour (after scrolling).

## Placeholders to replace before launch

- **Our Work**: shows one project, Climate Convergence Week, using its logo (`assets/work/`). Add a project photo there if you want one instead.
- **Partners**: logos for Climate Week Network, Climatebase, UBA, Olije Climate and The Net Clan are in `assets/partners/`.
- **LinkedIn**: the footer link is `href="#"` until the company page URL is confirmed.
- **Newsletter**: with no mailing-list service connected, Submit opens an email to info@frontieraccess.org asking to be added. To collect sign-ups automatically, set the form's `action`/`method` to your provider's form URL (see the comment above the form in `index.html`).
