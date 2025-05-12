# Working with the Monorepo

Calypso is a monorepo. In addition to the Calypso application, it also hosts a number of independent packages that are published to NPM, apps that are built and deployed as WordPress.com plugins, and other supporting packages.

## Module Layout

These packages live under the `packages` and `apps` directories, one folder per module.

Directories with packages are:

- `/packages` — projects and libraries that we might publish as [NPM packages](https://docs.npmjs.com/about-packages-and-modules). Typically used also elsewhere in Calypso. See "Publishing" below.
- `/apps` — WPCOM plugins
- `/desktop` - WP Desktop app. Currently this is not part of the monorepo in the sense that it has its own dependency tree (its own `yarn.lock`). The reason is we want a lean `node_modules` because it will be bundled with the WP Desktop app.
- `/client` - Calypso app.
- `/test/e2e` - Package to run e2e tests

Except those inside `/packages/*`, packages are not published to NPM.

Modules should follow our convention for layout:

```
# your package.json
package.json

# a readme for your module
README.md

# a changelog for your module
CHANGELOG.md

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

Your `package.json` can have any of the [normal properties](https://docs.npmjs.com/files/package.json) but at a minimum should contain `main`, `module`, `calypso:src` and `sideEffects`.

### devDependencies

It used to be that `devDependencies` needed to be added to the root `package.json` but since we moved to `yarn` workspaces we're able to add them as regular `devDependencies` within the package that uses them.

### sideEffects

> A "side effect" is defined as code that performs a special behavior when imported, other than exposing one or more exports. An example of this are polyfills, which affect the global scope and usually do not provide an export. [Read more](https://webpack.js.org/guides/tree-shaking/)

If your package contains ie `css` and `scss` files, update your `sideEffects` array as follows:

```json
{
	"sideEffects": [ "*.css", "*.scss" ]
}
```

failing to do so, will make your package work correctly in the dev build but tree shaking in production builds will result in discarding those files.

### A sample `package.json`

```json
{
	"name": "@automattic/your-package",
	"version": "1.0.0",
	"description": "My new package",
	"calypso:src": "src/index.js",
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
		"prepublish": "yarn run clean",
		"prepare": "transpile"
	}
}
```

If your package requires compilation, the `package.json` `build` script should compile the package:

- If it contains ES6+ code that needs to be transpiled, use `transpile` (from `@automattic/calypso-build`) which will automatically compile code in `src/` to `dist/cjs` (CommonJS) and `dist/esm` (ECMAScript Modules) by running `babel` over any source files it finds. Also, make sure to add `@automattic/calypso-build` in `devDependencies`.
- If it contains [assets](https://github.com/Automattic/wp-calypso/blob/d709f0e79ba29f2feb35690d275087179b18f632/packages/calypso-build/bin/copy-assets.js#L17-L25) (eg `.scss`) then after `transpile` append `&& copy-assets` ie `"build": "transpile && copy-assets"`.

`package.json` is linted using ESLint. Run `yarn eslint packages/*/package.json apps/*/package.json` to validate them.

If you need exceptions to linting rules, add a `./eslintrc.js` file to your app/package and disable the relevant rules.

## Running Tests

To run all of the package tests:

`yarn run test-packages`

To run one package's tests:

`yarn run test-packages [ test file pattern ]`

## Building packages & apps

Packages will have their `prepare` scripts run automatically on `yarn`.

You can build packages also by running:

```bash
yarn run build-packages
```

Or even specific packages:

```bash
yarn workspace @automattic/calypso-build run prepare
```

Or specific apps:

```bash
yarn workspace @automattic/wpcom-block-editor run build
```

All `prepare` scripts found in all `package.json`s of apps and packages are always run on Calypso's `yarn`. Therefore packages can use `build` instead of `prepare` so avoid unnecessary builds. Please only add a `prepare` script if your package really needs to be built for the rest of the repo to work.

You can also run other custom `package.json` scripts only for your app or package:

```bash
yarn workspace @automattic/your-package run your-script
```

## Developing packages

When developing packages in Calypso repository that external consumers (like Jetpack repository) depend on, you might want to test them without going through the publishing flow first.

1. Enter the package you're testing
1. Run [`yarn link`](https://classic.yarnpkg.com/en/docs/cli/link/) — the package will be installed on global scope and symlinked to the folder in Calypso
1. Enter the consumer's folder (such as Jetpack)
1. Type `yarn link @automattic/package-name` — the package will be symlinked between Calypso and Jetpack and any modifications you make in Calypso, will show up in Jetpack.
1. Remember to build your changes between modifications in Calypso.

Note that if you're building with Webpack, you may need to turn off [`resolve.symlinks`](https://webpack.js.org/configuration/resolve/#resolvesymlinks) for it to work as expected.

## Publishing

### Preparation

#### Make sure changelogs and `package.json` versions are up to date

For all packages that you want to publish, make sure that their `package.json` versions are bumped. Decide carefully whether you want to publish a patch, a minor or a major update of the package. Be mindful about [semantic versioning](https://semver.org/).

Make sure that the `CHANGELOG.md` document contains up-to-date information, with the `next` heading replaced with the version number that you are about to publish.

Create PRs with the necessary changes and merge them to `trunk` before publishing.

#### Checkout the latest trunk

Always publish from the latest `trunk` branch, so that the package contents come from a verified source that everyone has access to. It's too easy to publish a NPM package from a local branch, or even uncommitted local modifications that are invisible to anyone but you.

#### Getting NPM permissions to publish in the `@automattic` scope

To publish packages in the `@automattic` scope, and to update packages owned by the `automattic` organization, you need to be a member of this organization on npmjs.com. If you're an Automattician, you can add yourself to the organization, using the credentials found in the secret store.

#### Tagging a package

It is recommended you create a git tag with the package and version you are about to publish. This will help us track where a specific version comes from. For example:

```
git tag "@automattic/calypso-build@6.1.0"
# You can confirm with "y" when it asks you to push to trunk. This is ok since
# you aren't pushing commits, and GitHub will protect against that scenario.
git push --tags
```

### Publishing a package

Once the above steps (checkout `trunk`, get `@automattic` permissions, and package tagging) are done, you are ready to publish the package. Depending on the name of the package (found in the package's `package.json` file), you'll need to log into a different scope:

- If the package name is prefixed with `@automattic` (e.g. `@automattic/components`), run `yarn npm login --scope automattic`.
- If the package name is not prefixed (e.g. `eslint-plugin-wpcalypso`), run `yarn npm login`.

To verify it worked, use `yarn npm whoami --scope automattic` or `yarn npm whoami`.

To publish the package, run: `cd packages/<your-package> && yarn npm publish`.

Done!
