# @automattic/calypso-eslint-config

The ESLint config for this repository. The root `eslint.config.mjs` uses it as is, and a directory
with settings of its own adds an `eslint.config.mjs` that builds on it:

```js
import calypso from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{
		rules: {
			// This directory's settings. File patterns are relative to this directory.
		},
	},
] );
```

`defineConfig` also gives the export a type, which package type checks need where a package's `tsconfig.json` includes the config file.

A workspace that does this lists `@automattic/calypso-eslint-config` in its `devDependencies`. ESLint
uses the nearest `eslint.config.mjs` to each file and doesn't merge parent configs, so a config in a
subdirectory builds on its parent directory's config instead. ESLint reads a config entry's `files` relative to
the config it loaded, so a config that others build on sets `basePath: import.meta.dirname` on its entries.

The ESLint plugins it loads are the repository root's `devDependencies`.

Configs import this package by name, so a git worktree without its own `yarn install` runs the copy in the checkout whose `node_modules` it resolves. Install in the worktree before editing this package there.
