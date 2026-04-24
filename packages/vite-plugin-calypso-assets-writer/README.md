# @automattic/vite-plugin-calypso-assets-writer

Vite plugin that writes `build/assets.json` from Vite's `.vite/manifest.json`.

## What it does

After each production build, reads Vite's generated manifest and converts it to the `build/assets.json` format the Calypso Node.js server expects:

```json
{
  "manifests": [],
  "assets": {
    "entry-main": [
      "/calypso/evergreen/entry-main.[hash].min.js",
      "/calypso/evergreen/style.[hash].min.css"
    ]
  }
}
```

The server reads this via `client/server/middleware/assets.js` and uses `req.getFilesForChunkGroup(name)` to inject the right `<script>` and `<link>` tags into rendered pages.

## Usage

```js
import { viteBuildAssetsWriter } from '@automattic/vite-plugin-calypso-assets-writer';

export default defineConfig( {
	plugins: [
		viteBuildAssetsWriter( {
			outDir: path.join( __dirname, 'public/evergreen' ),
			buildDir: path.join( __dirname, 'build' ),
			publicPath: '/calypso/evergreen/',
			entrypoints: ENTRYPOINTS,
		} ),
	],
} );
```

## Options

| Option         | Type                     | Description                                          |
| -------------- | ------------------------ | ---------------------------------------------------- |
| `outDir`       | `string`                 | Absolute path to Vite's output directory.            |
| `buildDir`     | `string`                 | Absolute path to write `assets.json` into.           |
| `publicPath`   | `string`                 | URL prefix for assets (e.g. `/calypso/evergreen/`).  |
| `entrypoints`  | `Record<string, string>` | Map of entry-name → input file path.                 |
