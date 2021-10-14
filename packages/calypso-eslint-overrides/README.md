# @automattic/calypso-eslint-overrides

This package contains ESlint configuration used to override default ESLint settings, grouped by runtime.

The main use case is when a package has code expected to run in a browser, and code expected to run in Node.js.

## Usage

Imagine you have an `.eslintrc.js` that applies some config designed to enforce/prevent some code conventions that won't work well in a browser, or that inherits some rules from a parent `.eslintrc.js`

```
module.exports = {
	env: {
		browser: true
	},
	rules: {
		// Polyfill nodejs modules for the browser is expensive, disable them
		'import/no-nodejs-modules': 'error'
	}
}
```

If there is some section of the code that is meant to be run by Node.js (eg: a `./bin/` directory with some scripts), you can add an override like:

```
const { nodeConfig } = require('@automattic/calypso-eslint-overrides/node')

module.exports = {
	env: {
		browser: true
	},
	rules: {
		// Polyfill nodejs modules for the browser is expensive, disable them
		'import/no-nodejs-modules': 'error'
	},
	overrides: [
		{
			files: "./bin/**.*"
			...nodeConfig
		}
	]
}
```
