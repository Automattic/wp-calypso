# Apps

This directory exists to hold a variety of projects that can produce independent, binary-like outputs deployed elsewhere. Typically not published to NPM or build on `npm start`

For packages that we might publish as NPM packages, see [`/packages`](../packages).

## Adding a new app?

If you want to add a new project into this directory, then add a new directory and follow [monorepo -documentation](../docs/monorepo.md).

## Building

Apps (unlike packages) are not built on Calypso's `npm install`.

You must manually build apps by running:

```bash
npx lerna run build --scope="@automattic/app-name"
```
