# @automattic/vite-plugin-calypso-sections

Vite plugin for the Calypso sections system.

## What it does

`client/sections.js` is a plain data array where each entry has a `name` and `module` field but no `load` function. This plugin transforms that file so that every section gains a `load: () => import( '...' )` property, enabling dynamic code splitting via Rolldown.

It also injects a `manualChunks` function into `rolldownOptions.output` so that section chunks are named after the section name (e.g. `account.[hash].min.js`) rather than after the file name Rolldown would choose by default.

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
