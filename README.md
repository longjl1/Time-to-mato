# Time-to-mato

`Time-to-mato` is a monochrome focus workspace built with `Next.js`,
`TypeScript`, and `Base UI`.

It is designed as a calm, local-first productivity surface: one dashboard for
active work, one history view for patterns over time, and just enough structure
to manage tasks without turning the page into a heavy project manager.

## What It Includes

- a dashboard with a large animated countdown
- a current-task surface tied to the active queue
- task CRUD: create, edit, complete, reopen, and delete
- browser-side persistence with `localStorage`
- a history route with calendar density, recent logs, and archived tracks
- a restrained black-and-white UI built around spacing and contrast

## Stack

- Next.js App Router
- React
- TypeScript
- Base UI primitives

## Project Structure

- `app/`: routes, layout, and global styles
- `components/`: dashboard, timer, history, and navigation UI
- `lib/`: local data helpers and the focus store
- `docs/`: product notes, roadmap, CRUD notes, and release checks
- `public/`: shared SVG assets

## Current Product Direction

- keep the dashboard dense but readable
- treat the timer as the main visual anchor
- keep CRUD interactions lightweight and local-first
- let history summarize completed work without extra setup

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production

```bash
npm run build
npm run start
```
