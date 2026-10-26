# @automattic/calypso-eslint-overrides

This package contains ESlint configuration used to override default ESLint settings, grouped by runtime.

The main use case is when a package has code expected to run in a browser, and code expected to run in Node.js.

## Usage

Imagine you have an `eslint.config.mjs` that applies some config designed to enforce/prevent some code conventions that won't work well in Node.js:

```js
import globals from 'globals';

export default [
	{
		languageOptions: { globals: globals.browser },
		rules: {
			// Polyfill nodejs modules for the browser is expensive, disable them
			'import/no-nodejs-modules': 'error',
		},
	},
];
```

If there is some section of the code that is meant to be run by Node.js (eg: a `./bin/` directory with some scripts), add `flatNodeConfig` scoped to those files. Its rules include `import/no-nodejs-modules`, so register `eslint-plugin-import` as `import` in your config, as the example above needs too. It keeps your source type: ES modules still work, and top-level `return` works in scripts and `.cjs` files:

```js
import { flatNodeConfig } from '@automattic/calypso-eslint-overrides';

export default [
	// ...your other config
	{ ...flatNodeConfig, files: [ 'bin/**' ] },
];
```
