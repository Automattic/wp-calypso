# Changelog

## Unreleased

- Apply `@babel/preset-react` only outside `.ts` files, so `<T>value` assertions and generic arrows in them don't parse as JSX on Babel 8.
- With one job (`--jobs 1`, or a single file), extract in a worker thread like with several jobs, instead of in the calling process. Loading `process-files` no longer loads `@babel/core`, so it works under Jest once Babel is ESM-only.

## 1.2.0

- Add `@babel/preset-env` to the default preset.
- Remove deprecated `@babel/plugin-proposal-class-properties` plugin from the default preset.
