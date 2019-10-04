# Working with the Monorepo

Calypso is a monorepo. In addition to the Calypso application, it also hosts a number of independent modules that are published to NPM.

## Module Layout

These modules live under the `packages` and `apps` directories, one folder per module.

Two different directories for modules are:

`/packages` — projects and libraries that we might publish as [NPM packages](https://docs.npmjs.com/about-packages-and-modules). Typically used also elsewhere in Calypso and build on `npm start`. See "Publishing" below.
`/apps` — projects that can produce independent, binary-like outputs deployed elsewhere. Typically not published to NPM or build on `npm start`.

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

The only exception are `devDependencies` which _must be declared in the wp-calypso root `package.json`_. `devDependencies` of sub-packages in a monorepo are not reliably installed and cannot be relied on.

### A sample `package.json`

```json
{
	"name": "@automattic/your-package",
	"version": "1.0.0",
	"description": "My new package",
	"main": "dist/cjs/index.js",
	"module": "dist/esm/index.js",
	"sideEffects": false,
	"keywords": [ "wordpress" ],
	"author": "Automattic Inc.",
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
	"files": [ "dist", "src" ],
	"scripts": {
		"clean": "npx rimraf dist",
		"prepublish": "npm run clean",
		"prepare": "transpile"
	}
}
```

If your package requires compilation, the `package.json` `prepare` script should compile the package. If it contains ES6+ code that needs to be transpiled, use `transpile` (from `@automattic/calypso-build`) which will automatically compile code in `src/` to `dist/cjs` (CommonJS) and `dist/esm` (ECMAScript Modules) by running `babel` over any source files it finds.

Running `npm run lint:package-json` will lint all `package.json`'s under `./packages|apps/**` based on [`npmpackagejsonlint.config.js`](../npmpackagejsonlint.config.js).

## Running Tests

To run all of the package tests:

`npm run test-packages`

To run one package's tests:

`npm run test-packages [ test file pattern ]`

## Building packages & apps

Packages will have their `prepare` scripts run automatically on `npm install`.

You can build packages also by running:

```bash
npm run build-packages
```

Or even specific packages:

```bash
npx lerna run prepare --scope="@automattic/calypso-build"
```

Or specific apps:

```bash
npx lerna run build --scope="@automattic/calypso-build"
```

All `prepare` scripts found in all `package.json`s of apps and packages are always run on Calypso's `npm install`. Therefore independent apps in `/apps` directory can use `build` instead of `prepare` so avoid unnecessary builds.

You can also run other custom `package.json` scripts only for your app or package:

```bash
npx lerna run your-script --scope="@automattic/your-package"
```

## Developing packages

When developing packages in Calypso repository that external consumers (like Jetpack repository) depend on, you might want to test them without going through the publishing flow first.

1. Enter the package you're testing
1. Run [`npm link`](https://docs.npmjs.com/cli/link) — the package will be installed on global scope and symlinked to the folder in Calypso
1. Enter the consumer's folder (such as Jetpack)
1. Type `npm link @automattic/package-name` — the package will be symlinked between Calypso and Jetpack and any modifications you make in Calypso, will show up in Jetpack.
1. Remember to build your changes between modifications in Calypso.

Note that if you're building with Webpack, you may need to turn off [`resolve.symlinks`](https://webpack.js.org/configuration/resolve/#resolvesymlinks) for it to work as expected.

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
