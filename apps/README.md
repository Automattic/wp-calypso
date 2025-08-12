# Apps

This directory exists to hold a variety of projects that can produce independent, binary-like outputs deployed elsewhere. Typically not published to NPM or built on `yarn start`.

For packages that we might publish as NPM packages, see [`/packages`](../packages).

## Adding a new app?

If you want to add a new project into this directory, then add a new directory and follow [monorepo -documentation](../docs/guide/monorepo.md).

## Building

Apps (unlike packages) are not built on Calypso's `yarn`.

You must manually build apps by running:

```bash
cd apps/app-name
yarn build

# Or any other command in the app's package.json
# E.g. for the FSE plugin dev & sync command:
yarn dev --sync
```

## Validating package.json

`package.json` is linted using ESLint. Run `yarn eslint apps/*/package.json` to validate them.

If you need exceptions to linting rules, add a `./eslintrc.js` file to your app and disable the relevant rules.
