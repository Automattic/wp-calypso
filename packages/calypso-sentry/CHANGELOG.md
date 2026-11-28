# Changelog

## Unreleased

- For errors with a cause, including those React's error boundaries catch, the `handled` and `mechanism` properties sent to Logstash now describe how the error was caught, instead of Sentry's linked-errors step.

## 2.0.0

- Update `@sentry/react` from 7 to 10, which accepts React 19.
- Remove `configureScope`, which Sentry removed in v8. Use `setTag`, or the scope helpers, instead.
- Load only the SDK functions the package calls, so the lazy chunk no longer includes Replay, Feedback and tracing.
- The `mechanism` property sent to Logstash uses Sentry 10's names, such as `auto.browser.global_handlers.onerror` instead of `onerror` and `auto.browser.browserapierrors.*` instead of `instrument`.
- Sentry 10's built-in filter drops a few more browser and webview errors than 7 did, such as "Can't find variable: gmo", the `solana` property error and "Java object is gone", so they no longer reach Logstash.

## 1.1.0

- Add `setTag` for setting a single scope-level tag. Prefer it over `configureScope`, which is now deprecated (Sentry removed it in @sentry/react v8).

## 1.0.1

- Declare React 19 compatibility for package consumers (#111721).
