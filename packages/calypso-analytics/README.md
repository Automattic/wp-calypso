Calypso Analytics.
=================

Currently this package supports calls to Tracks only.

Automatticians may refer to internal documentation for more information about Tracks.

## Usage

Note: In most situations it is best to use the [Analytics Middleware](https://github.com/Automattic/wp-calypso/tree/master/client/state/analytics), which has no direct browser dependencies and therefore will not complicate any unit testing of the modules where it is used.

### `recordTracksEvent( name, properties )`

```js
import { recordTracksEvent } from '@automattic/calypso-analytics';

recordTracksEvent( 'calypso_signup_step_start', { step: 'a_nice_step' } );

```

_Note: Unless you have a strong reason to call `recordTracksEvent` directly, you should use the Analytics Middleware instead:_

```js
import { recordTracksEvent } from 'state/analytics/actions';

dispatch( recordTracksEvent( 'calypso_checkout_coupon_apply', { coupon_code: 'abc123' } ) );
```

Record an event with optional properties:

```js
import { initializeAnalytics, recordTracksEvent } from '@automattic/calypso-analytics';

// first the module should be initialized with extra metadata by caling initialize once from app boot or other middleware
// ... client/boot/common.js
initializeAnalytics( currentUser, superProps );

//in your component
recordTracksEvent( 'calypso_do_thing', { extra: 'info' } );
```

#### Deprecates

`recordTracksEvent( name, properties )` deprecates the following call to the analytics lib method:

```js
import analytics from 'lib/analytics';
analytics.tracks.recordEvent( name, properties );
```

## Naming Conventions

To be recorded, event names originating from Calypso must be prefixed by `calypso_`, and each token in the event and property names must be separated by an underscore (`_`).

_Note: Events not prefixed by `calypso_`, with words not separated by underscore (e.g. by spaces or dashes), or written in camel case, **will be discarded**._

In order to keep similar events grouped together when sorted in an alphabetized list (as is typical with analytics tools), put the verb at _the end_ of the event name:

- `calypso_cart_product_add`
- `calypso_cart_product_remove`

If we had instead used `calypso_add_cart_product` and `calypso_remove_cart_product`, then they'd likely be separated in a list of all the event names.

Finally, for consistency, the verb at the end should be in a non-conjugated form like `add`, `remove`, `view`, or `click`, and _not_ `adds`, `added`, or `adding`.

With the exception of separating tokens with underscores, these rules do not apply to property names. `coupon_code` is perfectly fine.
