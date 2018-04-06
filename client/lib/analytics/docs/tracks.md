Analytics: Tracks
=================

Automatticians may refer to internal documentation for more information about Tracks.

## Usage

### `analytics.tracks.recordEvent( eventName, eventProperties )`

Record an event with optional properties:

```js
analytics.tracks.recordEvent( 'calypso_checkout_coupon_apply', {
	'coupon_code': 'abc123'
} );
```

## Naming Conventions

To be recorded, event names originating from Calypso must be prefixed by `calypso_`, and each token in the event and property names must be separated by an underscore (`_`).

_Note: Events not prefixed by `calypso_`, with words not separated by underscore (e.g. by spaces or dashes), or written in camel case, **will be discarded**._

In order to keep similar events grouped together when output in an alphabetized list (as is typical with analytics tools), put the verb at _the end_ of the event name:

- `calypso_cart_product_add`
- `calypso_cart_product_remove`

If we had instead used `calypso_add_cart_product` and `calypso_remove_cart_product` for example, then they'd likely be separated in a list of all the event names.

Finally, for consistency, the verb at the end should be in the form `add`, `remove`, `view`, `click`, etc and _not_ `adds`, `added`, `adding`, etc.

With the exception of separating tokens with underscores, these rules do not apply to property names. `coupon_code` is perfectly fine.
