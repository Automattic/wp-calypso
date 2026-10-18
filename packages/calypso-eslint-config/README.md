# @automattic/calypso-eslint-config

The ESLint config for this repository. The root `eslint.config.mjs` uses it as is, and a directory
with settings of its own adds an `eslint.config.mjs` that builds on it:

```js
import calypso from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso( import.meta.dirname ),
	{
		rules: {
			// This directory's settings. File patterns are relative to this directory.
		},
	},
];

export default config;
```

The type keeps package type checks passing where a package's `tsconfig.json` includes the config file.

A workspace that does this lists `@automattic/calypso-eslint-config` in its `devDependencies`. ESLint
uses the nearest `eslint.config.mjs` to each file and doesn't merge parent configs, so a config in a
subdirectory builds on its parent directory's config instead. ESLint reads a config entry's `files` relative to
the config it loaded, so a config that others build on sets `basePath: import.meta.dirname` on its entries.

The ESLint plugins it loads are the repository root's `devDependencies`.
