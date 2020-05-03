# Working with the Monorepo

Calypso is a monorepo. In addition to the Calypso application, it also hosts a number of independent modules that are published to NPM.

## Module Layout

These modules live under the `packages` and `apps` directories, one folder per module.

Two different directories for modules are:

`/packages` — projects and libraries that we might publish as [NPM packages](https://docs.npmjs.com/about-packages-and-modules). Typically used also elsewhere in Calypso and build on `yarn start`. See "Publishing" below.
`/apps` — projects that can produce independent, binary-like outputs deployed elsewhere. Typically not published to NPM or build on `yarn start`.

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
		"prepublish": "yarn run clean",
		"prepare": "transpile"
	}
}
```

If your package requires compilation, the `package.json` `prepare` script should compile the package. If it contains ES6+ code that needs to be transpiled, use `transpile` (from `@automattic/calypso-build`) which will automatically compile code in `src/` to `dist/cjs` (CommonJS) and `dist/esm` (ECMAScript Modules) by running `babel` over any source files it finds.

Running `yarn run lint:package-json` will lint all `package.json`'s under `./packages|apps/**` based on [`npmpackagejsonlint.config.js`](../npmpackagejsonlint.config.js).

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
npx lerna run prepare --scope="@automattic/calypso-build"
```

Or specific apps:

```bash
npx lerna run build --scope="@automattic/calypso-build"
```

All `prepare` scripts found in all `package.json`s of apps and packages are always run on Calypso's `yarn`. Therefore independent apps in `/apps` directory can use `build` instead of `prepare` so avoid unnecessary builds.

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

We use [Lerna](https://lernajs.io/) and its `publish` command to publish the monorepo packages to NPM registry. Please do not use regular [`yarn publish`](https://docs.npmjs.com/cli/publish) within a package to publish an individual package; `npx` has issues using this flow.

### Make sure changelogs and `package.json` versions are up to date

For all packages that you want to publish, make sure that their `package.json` versions are bumped. Decide carefully whether you want to publish a patch, a minor or a major update of the package. Be mindful about [semantic versioning](https://semver.org/).

Make sure that the `CHANGELOG.md` document contains up-to-date information, with the `next` heading replaced with the version number that you are about to publish.

Create PRs with the necessary changes and merge them to `master` before publishing. Lerna will add a `gitHead` field to each published package's `package.json`. That field contains the hash of the Git commit that the package was published from. It's better if this commit hash is a permanent one from the `master` branch, rather than an ephemeral commit from a local branch.

### Checkout the latest master locally and build the packages

Always publish from the latest `master` branch, so that the package contents come from a verified source that everyone has access to. It's too easy to publish a NPM package from a local branch, or even uncommitted local modifications that are invisible to anyone but you.

Build the `dist/` directories (the transpiled package content that will be published) from scratch.

```
git checkout master
git pull
git status (should be clean!)
yarn run distclean
yarn install --frozen-lockfile
yarn run build-packages
```

### Getting NPM permissions to publish in the `@automattic` scope

To publish packages in the `@automattic` scope, and to update packages owned by the `automattic` organization, you need to be a member of this organization on npmjs.com. If you're an Automattician, ask around to find an organization owner or admin who will add you as a member. Publish packages under your own name, so that people can find you and ping you in case anything goes wrong with the published package.

### Publishing all outdated packages

It's good to start un-authenticated, since Lerna doesn't have `--dry-run` option like NPM does: `npm logout`.

Now run: `npx lerna publish from-package`

Lerna will show a list of packages that have versions higher than the latest one published in the NPM registry. Verify that this is indeed the list of packages that you want to publish. If something looks off, abort!

If you say "yes" to the Lerna prompt, and are not authenticated, the publishing will fail with authentication error. Better to say "no".

Now make sure you're logged in at this point, we're going to publish 🚀: `npm whoami`, `npm login`. Enter your username, password, and the OTP code.

Before publishing, keep your OTP (one time password) authenticator app around, as NPM will ask for another OTP code when publishing, even though you already entered one code when logging in. We recommend to set your NPM account to the highest security level, which requires two-factor authentication for both authentication and publishing.

The following command will publish the packages:

```
npx lerna publish from-package
```

Lerna will ask you to confirm the publish action, and will also ask for an OTP code.

Pat yourself on the back, you published!

#### Publishing unstable (beta) versions of packages

If you publish a package the default way, the new version will be tagged in the NPM registry with the `latest` tag. NPM clients will install the `latest` version by default, if no other version is specified.

To publish unstable (alpha, beta) versions of packages, and to keep the `latest` tag pointing to a stable version, you can add a `--dist-tag next` option:

```
npx lerna publish --dist-tag next from-package
```

The published packages will be tagged as `next`, and installed only when the `next` tag is specified explicitly:

```
yarn install i18n-calypso@next
```

#### Running `lerna publish` in non-interactive mode

If you don't want Lerna to ask you any questions when publishing, specify the `--yes` option to skip the confirmation prompt.

The OTP code can be specified as the `NPM_CONFIG_OTP` environment variable, again avoiding Lerna/NPM asking for it interactively. For example:

```
NPM_CONFIG_OTP=[YOUR_OTP_CODE] npx lerna publish from-package --yes
```

### Publishing a single package

What if you want to publish just one updated package? `lerna publish from-package` either publishes all eligible packages, or nothing. It doesn't give you a choice. That's where you need `lerna publish from-git`.

To publish only selected packages, you need to create Git tags in form `name@version`. For example:
```
git tag "@automattic/calypso-build@6.1.0"
```
or
```
git tag "@automattic/components@1.0.0"
```

Now `lerna publish from-git` will offer to publish only the packages that have a matching Git tag on the current `HEAD` revision.

The rest of the workflow is exactly the same as in the `from-package` case.
