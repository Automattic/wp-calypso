# Packages

This directory exists to hold a variety of projects and libraries that we might publish as [NPM packages](https://docs.npmjs.com/about-packages-and-modules). Typically used also elsewhere in Calypso and build on `yarn start`.

For projects that can produce independent, binary-like outputs deployed elsewhere, see [`/apps`](../apps).

## Adding a new package?

If you want to add a new project or package into this directory, then add a new directory and follow [monorepo -documentation](../docs/monorepo.md).

## Building

Packages are built on Calypso's `yarn` so you don't need to build them manually, unless you are working directly on them.

If you must manually build a single package, run:

```bash
npx lerna run prepare --scope="@automattic/package-name"
```

## Validating package.json
Running `yarn run lint:package-json` will lint all `package.json`'s under `./packages/**` based on [`npmpackagejsonlint.config.js`](../npmpackagejsonlint.config.js).

If you need exceptions to linting rules, add them to overrides section in the config file.
