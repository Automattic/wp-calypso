# PROTOTYPE (DOTMSD-1682): section CSS in start:vite

Throwaway measurement scripts. Run from the repo root.

1. Build the dev Node server with Vite: `CALYPSO_ENV=development node build-tools/vite/PROTOTYPE-section-css/build-server.mjs`
   (add `CALYPSO_VITE_IMAGE_URLS=webpack` for the old `/calypso/evergreen/images/*` URLs).
2. `node build-tools/vite/PROTOTYPE-section-css/measure.mjs <walk|startup|combined|none> [/route,/route] [WAIT_STARTUP=1]`:
   timings, linked vs injected sheets, image 404s, hydration warnings, computed-style fingerprints and
   sheet order, written to `tmp/section-css-out/<mode>/`.
3. `hmr.mjs [mode]`: edits a linked section sheet with `/themes` open; checks the link swaps with no reload.
4. `rewalk.mjs`: cost of recomputing closures after a JS edit.

Serve with `CALYPSO_ENV=development CALYPSO_BUNDLER=vite CALYPSO_VITE_ALL=1 PORT=3010 node build/server-vite-dev.cjs`.
