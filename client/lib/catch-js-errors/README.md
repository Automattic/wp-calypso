Catch JS Errors
=========

This module is responsible for catching JS errors in calypso and sending them to the API for tracking/aggregation.

## Automat(t)ic catching

If enabled, this module captures `window.onerror` calls and sends them to the API automatically to be processed.

## Arbitrary logging

For hard-to-debug cases, `log` function is being exported to log unusual events.

#### Example

```JavaScript
import log from 'lib/catch-js-errors/log';

//Something unusual happened
log( 'This is unexpected', { additionalData: 'data' } );

```
