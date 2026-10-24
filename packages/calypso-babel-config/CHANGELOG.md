# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Apply JSX syntax (`@babel/preset-react`, `@emotion/babel-plugin` and the `wordpress-element` preset's plugins) only outside `.ts` files, so `<T>value` assertions and generic arrows in them don't parse as JSX on Babel 8. `.ts` files still get preset-react's `/*#__PURE__*/` annotations for React calls.
- Remove `@emotion/react` import source configuration for `@babel/preset-react` from the default preset
- Introduce `importSource` preset option and `IMPORT_SOURCE` env variable to allow configuring import source for `@babel/preset-react`

### Added

- Initial release
