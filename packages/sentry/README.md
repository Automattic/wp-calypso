# @automattic/sentry

The main purpose is to stub basic Sentry methods so that Automattic code
can use them. In Calypso we async-load Sentry for only a certain percent of
requests. Once Sentry has finished loading, Calypso will send any messages
which have been queued by this package.

See `client/lib/sentry`.

## Usage

```typescript
import {
   addBreadcrumb,
   captureEvent,
   captureException,
   captureMessage,
   configureScope,
   withScope
} from '@automattic/sentry';

// Call these functions to capture an event in Sentry. They mimic the functions with the
// same names in the official `@sentry/react`, however it will queue the message up to
// be sent if Calypso is still setting up Sentry.
// See https://docs.sentry.io/platforms/javascript/guides/react/usage/

// addBreadcrumb( ... );
// captureEvent( ... );
// captureException( ... );
// captureMessage( ... );
// configureScope( ... );
// withScope( ... );

// e.g.
try {
   throw new Error();
} catch ( e ) {
   captureException( e );
}
```
