# @automattic/vite-plugin-calypso-sections

Vite plugin for the Calypso sections system.

## What it does

`client/sections.js` is a plain data array where each entry has a `name` and `module` field but no `load` function. This plugin transforms that file so that every section gains a `load` property, enabling dynamic code splitting via Rolldown.

### Client build

- Every section is rewritten to `load: () => import( '...' )` so Rolldown code-splits each section.
- A `manualChunks` function is pushed onto `rolldownOptions.output` so section chunks are named after the section name (e.g. `account.[hash].min.js`) rather than the file name Rolldown would choose by default.

### SSR build

Mirrors webpack's `sections-loader` with `useRequire: true, onlyIsomorphic: true`:

- Only `isomorphic: true` sections get a `load` function; the rest are left untouched.
- `load` is a synchronous `() => _sectionMod<i>` returning a statically-imported namespace, so the server can call `section.load().default(...)` without `await`.
- No `manualChunks` is registered — the server bundle isn't code-split by section.

## Usage

```js
import { vitePluginSections } from '@automattic/vite-plugin-calypso-sections';

export default defineConfig( {
	plugins: [
		vitePluginSections( { root: __dirname } ),
	],
} );
```

## Options

| Option | Type     | Description                                    |
| ------ | -------- | ---------------------------------------------- |
| `root` | `string` | Absolute path to the Vite root (project root). |
