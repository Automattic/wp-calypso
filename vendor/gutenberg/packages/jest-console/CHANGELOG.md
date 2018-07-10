## 2.0.0 (Unreleased)

- Breaking: Add new API methods `toHaveInformed`, `toHaveInformedWith`, `toHaveLogged` and `toHaveLoggedWith` ([#137](https://github.com/WordPress/packages/pull/137)). If the code under test calls `console.log` or `console.info` it will fail, unless one of the newly introduced methods is explicitly used to verify it.
- Breaking: Updated code to work with Babel 7 ([#7832](https://github.com/WordPress/gutenberg/pull/7832))
- Moved `@WordPress/packages` repository to `@WordPress/gutenberg` ([#7805](https://github.com/WordPress/gutenberg/pull/7805))

## 1.0.7 (2018-05-18)

- Fix: Standardized `package.json` format  ([#119](https://github.com/WordPress/packages/pull/119))

## 1.0.6 (2018-02-28)

- Removed `package-lock.json` file, lockfiles for apps, not packages ([#88](https://github.com/WordPress/packages/pull/88))
