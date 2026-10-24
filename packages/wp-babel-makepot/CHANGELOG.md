# Changelog

## Unreleased

- Apply `@babel/preset-react` only outside `.ts` files, so `<T>value` assertions and generic arrows in them don't parse as JSX on Babel 8.

## 1.2.0

- Add `@babel/preset-env` to the default preset.
- Remove deprecated `@babel/plugin-proposal-class-properties` plugin from the default preset.
