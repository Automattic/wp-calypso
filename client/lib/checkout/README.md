## Checkout validation and API

This module contains functions to validate and mask checkout form fields such as credit card fields.

## API

### `getCreditCardType( number )`

Returns credit card brand for a given card number

### `maskField( fieldName, previousValue, nextValue )`

Returns a masked input value for the given field based on the current value and the next value to replace it with.

### `unmaskField( fieldName, previousValue, nextValue )`

Returns an unmasked input value that is meant to be used within the program rather than displayed to the user.
