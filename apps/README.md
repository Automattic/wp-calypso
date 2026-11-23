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

Apps that ship to WordPress.com (`notifications`, `wpcom-block-editor`, `odyssey-stats`, `blaze-dashboard`, `o2-blocks`, `happy-blocks`, `help-center`, `agents-manager` and `survicate`) deploy separately from Calypso. TeamCity's "Build Calypso Apps" builds them automatically for `trunk` commits and tags each app whose build changed. `install-plugin.sh <app> --release` on a WordPress.com sandbox then opens the WordPress.com PR that ships it.

"Build Calypso Apps" doesn't build PR branches by itself. To try a branch on a sandbox, run `yarn dev --sync` in the app's folder to build your working copy and sync it to the sandbox (it needs a `wpcom-sandbox` SSH host). Or have someone with TeamCity access run "Build Calypso Apps" for the branch, then run `install-plugin.sh <app> <branch>` on the sandbox. For an app under `widgets.wp.com`, sandbox `widgets.wp.com` too. A branch build comments on the PR with the apps it changed.

`<app>` is the app's `install-plugin.sh` slug: its folder name, except `hc` for `help-center` and `am` for `agents-manager`.

## Validating package.json

`package.json` is linted using ESLint. Run `yarn eslint apps/*/package.json` to validate them.

If you need exceptions to linting rules, add an `eslint.config.mjs` to your app that builds on `@automattic/calypso-eslint-config`, and add that package to its `devDependencies`. See the [package's README](../packages/calypso-eslint-config/README.md) for an example.
