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

The only exception are `devDependencies` which _must be declared in the wp-calypso root package.json_. `devDependencies` of sub-packages in a monorepo are not reliably installed and cannot be relied on.

### A sample `package.json`

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
	"contributors": [],
	"homepage": "https://github.com/Automattic/wp-calypso",
	"license": "GPL-2.0-or-later",
	"repository": {
		"type": "git",
		"url": "git+https://github.com/Automattic/wp-calypso.git",
		"directory": "packages/your-package"
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
		"clean": "npx rimraf dist",
		"prepublish": "npm run clean",
		"prepare": "npx @automattic/calypso-build"
	}
}
```

If your package requires compilation, the `package.json` `prepare` script should compile the package. If it contains ES6+ code that needs to be transpiled, use `npx @automattic/calypso-build` which will automatically compile code in `src/` to `dist/cjs` (CommonJS) and `dist/esm` (ECMAScript Modules) by running `babel` over any source files it finds.

## Running Tests
To run all of the package tests:

`npm run test-packages`

To run one package's tests:

`npm run test-packages [ test file pattern ]`

## Publishing

Please do not use regular [`npm publish`](https://docs.npmjs.com/cli/publish) within a package to publish an individual package; `npx` has issues using this flow.

Using [Lerna](https://lernajs.io/) to publish package(s):

1. Might be good to start un-authenticated, since Lerna doesn't have `--dry-run` option like NPM does: `npm logout`.
1. Update packages versions as necessary. We’ll rely on package versions for Lerna to know what to publish. Please be mindful about [semantic versioning](https://semver.org/).
1. `git checkout master`
1. `git pull`
1. `git status` (should be clean!)
1. `npm run distclean`
1. `npm ci`
1. `npx lerna publish from-package`
1. Say “no” at the prompt.
1. Lerna will confirm which packages and versions will be published. If something looks off, abort!
1. Make sure you're logged in at this point, we're going to publish 🚀: `npm whoami`, `npm login`.
1. Craft the following command, we'll add `--yes` to skip prompts and save OTP cycle time. `--dist-tag next` is optional, use it when publishing unstable versions.
1. Wait for your npm OTP (one time password) cycle to start, write it into the command and publish:
1. `NPM_CONFIG_OTP=[YOUR_OTP_CODE] npx lerna publish --dist-tag next from-package --yes`
1. Pat yourself on the back, you published!
