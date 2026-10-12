# Deflock Houston
## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+

## Run

```
npm install
npm start          # http://localhost:4200
npm run build      # dist/houston-alpr/browser
```

Tailwind v4 is wired through PostCSS (`.postcssrc.json`). There is no
`tailwind.config.js`; the theme lives in `src/styles.css` under `@theme`.

## Where things are

| What | File |
| --- | --- |
| Color and type tokens | `src/styles.css` |
| Routes | `src/app/app.routes.ts` |
| Header, footer | `src/app/layout/` |
| Hero | `src/app/pages/home/hero.ts` |
| Page sections and stat strip | `src/app/pages/home/home.html`, `home.ts` |
| FAQ copy | `src/app/faq/faq.data.ts` |
| FAQ behavior and markup | `src/app/faq/faq-accordion.ts`, `.html` |
| Dashboard shell | `src/app/pages/dashboard/dashboard.ts` |
