# Changelog

## 2.0.0

- Update `@sentry/react` from 7 to 10, which accepts React 19.
- Remove `configureScope`, which Sentry removed in v8. Use `setTag`, or the scope helpers, instead.
- Load only the SDK functions the package calls, so the lazy chunk no longer includes Replay, Feedback and tracing.

## 1.1.0

- Add `setTag` for setting a single scope-level tag. Prefer it over `configureScope`, which is now deprecated (Sentry removed it in @sentry/react v8).

## 1.0.1

- Declare React 19 compatibility for package consumers (#111721).
