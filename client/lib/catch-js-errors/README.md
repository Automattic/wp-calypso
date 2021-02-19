# Catch JS Errors

This module is responsible for catching JS errors in Calypso and sending them to the API for tracking/aggregation.

## Automatic catching

If enabled, this module captures `window.onerror` calls and sends them to the API automatically to be processed.

## Arbitrary logging

For hard-to-debug cases, `log` function is being exported to log unusual events.

### Example

```javascript
import log from 'calypso/lib/catch-js-errors/log';

// Something unusual happened
log( 'This is unexpected', { additionalData: 'data' } );
```

### Use cases

- A piece of code you suspect is dead
- Function that is triggered by weird parameters
- Place you dont know how many people reach

Generally, whenever you are wondering "what kind of users hit this place?" or you want to gather more data to debug a hard error, you can use the logger to make your life a bit easier.

### Gotchas

Logger is initialized only on non-SSR environment and after initializing redux store. So you want be able to log any redux discrepencies.
This is actually good, since you dont want to log any action that can flood the endpoint.
