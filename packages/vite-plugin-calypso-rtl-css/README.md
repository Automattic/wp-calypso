# @automattic/vite-plugin-calypso-rtl-css

Vite plugin that generates RTL CSS variants for every emitted CSS file.

## What it does

After each production build, processes every `.css` file through [rtlcss](https://rtlcss.com/) and emits a `.rtl.css` sibling alongside the original. Mirrors `@automattic/webpack-rtl-plugin`.

For example, `style.DA6dYlVQ.min.css` produces `style.DA6dYlVQ.min.rtl.css`.

## Usage

```ts
import { vitePluginRtlCss } from '@automattic/vite-plugin-calypso-rtl-css';

export default defineConfig( {
	plugins: [
		vitePluginRtlCss(),
	],
} );
```

## Options

| Option       | Type       | Description                                             |
| ------------ | ---------- | ------------------------------------------------------- |
| `test`       | `RegExp`   | Only process files matching this pattern (optional).    |
| `rtlOptions` | `object`   | Options passed to `rtlcss.process()`.                   |
| `rtlPlugins` | `unknown[]`| Plugins passed to `rtlcss.process()`.                   |
