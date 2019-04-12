# Packages

This directory exists to hold a variety of projects and libraries that we use in Calypso but also might publish as independent outputs or packages.

For applications that are not used in Calypso, see [`/apps`](../apps)

## Adding a new package?

If you want to add a new project or package into this directory, then add a new directory and follow [Publishing with the Monorepo](../docs/monorepo.md) -documentation.

## Building

Packages are built on Calypso's `npm install` so you don't need to build them manually, unless you are working directly on them.

If you must manually build a single package, run:

```bash
npx lerna run prepare --scope="@automattic/package-name"
```
