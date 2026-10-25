# Changelog

## 2.0.0

### Breaking changes

- Extract strings by parsing files with [oxc-parser](https://www.npmjs.com/package/oxc-parser) instead of compiling them with Babel. The package no longer depends on Babel or reads a project's Babel or browserslist configuration, which could make extraction fail. The extracted strings are unchanged.
- Require Node.js `^20.19.0` or `>=22.12.0`.
- Remove the `--preset` option and the presets it selected. JavaScript, JSX, TypeScript and decorators parse without one.

### Other changes

- Extraction is about 5 times faster with `--jobs 1` and 3 times faster with `--jobs auto` on Calypso's sources.
- When a `Plural-Forms` header is passed in `headers`, plural strings get one empty `msgstr` per plural form instead of a single one.
- Run the package's tests with Vitest.

## 1.2.0

- Add `@babel/preset-env` to the default preset.
- Remove deprecated `@babel/plugin-proposal-class-properties` plugin from the default preset.
