## Checkout validation and API

This module contains functions to validate and mask checkout form fields such as credit card fields.

## API

### `validatePaymentDetails( paymentDetails )`

Returns an object containing the errors for each field. For example the returned object might look like this:

```js
const error = {
	number: [ 'Invalid credit card' ],
};
```

If there are any missing fields, there are no errors for that field.

### `getCreditCardType( number )`

Returns credit card brand for a given card number

### `maskField( fieldName, previousValue, nextValue )`

Returns a masked input value for the given field based on the current value and the next value to replace it with.

### `unmaskField( fieldName, previousValue, nextValue )`

Returns an unmasked input value that is meant to be used within the program rather than displayed to the user.
