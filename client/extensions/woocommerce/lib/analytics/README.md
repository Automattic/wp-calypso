# Store Analytics

This library is for adding analytics code to Store on WP.com

It's designed to consolidate things like verifying we're using the same prefix on
all track event ids, and perhaps to add some common event properties automatically.

## How to use

```js
import { recordTrack } from 'woocommerce/lib/analytics';

recordTrack( 'calypso_woocommerce_event_to_be_tracked', {
	a_parameter: '1',
	another_parameter: '2',
} );
```

## Functions

### `recordTrack( eventName, eventProperties )`

Arguments:

- `eventName`: The name of the event, must be prefixed with `calypso_woocommerce_`.
- `eventProperties`: The properties of the event to be tracked.

Records a track event with the specified event name and properties.
Enforces a `calypso_woocommerce_` prefix.
