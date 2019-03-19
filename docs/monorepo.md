Publishing Packages with the Monorepo
=====================================

Calypso is a monorepo. In addition to the Calypso application, it also hosts a number of independent modules that are published to NPM.

## Module Layout

These modules live under the `packages` directory, one folder per module.

Modules should follow our convention for layout:
```
# your package.json
package.json

# a readme for your module
README.md

# source code lives here
src/
	# exports everything the modules offers
	index.js

	# individual modules, imported by index.js
	module-a.js
	module-b.js

# tests for the module
test/
	index.js
	module-a.js
	module-b.js
```

Your `package.json` can have any of the [normal properties](https://docs.npmjs.com/files/package.json) but at a minimum should contain `main`, `module`, and `sideEffects`.

A sample `package.json`:

```json
{
	"name": "@automattic/your-package",
	"version": "1.0.0",
	"description": "My new package",

	"main": "dist/cjs/index.js",
	"module": "dist/esm/index.js",
	"sideEffects": false,

	"keywords": [
		"wordpress"
	],
	"author": "Your Name <you@example.com> (https://yoursite.wordpress.com/)",
	"contributors": [

	],
	"homepage": "https://github.com/Automattic/wp-calypso",
	"license": "GPL-2.0-or-later",
	"repository": {
		"type": "git",
		"url": "git+https://github.com/Automattic/wp-calypso.git"
	},
	"publishConfig": {
		"access": "public"
	},
	"bugs": {
		"url": "https://github.com/Automattic/wp-calypso/issues"
	},
	"files": [
		"dist",
		"src"
	],
	"scripts": {
		"build": "node ../../bin/build-package"
	}
}
```

If your `package.json` specifies a `build` script, our package compiler will use that to compile the package. If it contains ES6+ code that needs to be transpiled, use Calypso's `bin/build-package` which will automatically compile code in `src/` to `dist/`, running `babel` over any source files it finds.

## Running Tests
To run all of the package tests:

`npm run test-packages`

To run one package's tests:

`npm run test-packages -- <package folder>`

## Publishing

We do not use the plain `lerna publish` flow. Instead, use `lerna publish from-package` to publish all packages currently out of date, or `npm publish` within a package to publish an individual package. The standard workflow is too limiting for our needs.
