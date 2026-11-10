## 1.0.0-alpha.1

- Breaking: removed `isCalypsoLive()`. Use `isCalypsoLiveHostname( window.location.hostname )` from `@automattic/calypso-url` instead, which also works on the server given the request hostname.

## 1.0.0-alpha.0

Extracted from `create-config` and transformed to TypeScript.
