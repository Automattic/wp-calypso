credit-card-details
-------------------

This module contains functions to validate and mask credit card form fields.

## API

### `maskField( fieldName, previousValue, nextValue )`

Returns a masked input value for the given field based on the current value and the next value to replace it with.

### `unmaskField( fieldName, previousValue, nextValue )`

Returns an unmasked input value that is meant to be used within the program rather than displayed to the user.

### `validateCardDetails( cardDetails )`

Returns an object containing the errors for each field. For example the returned object might look like this:

```js
{ number: [ 'Invalid credit card' ] }
```

If there are any missing fields, there are no errors for that field.
