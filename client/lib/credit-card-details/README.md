credit-card-details
-------------------

This module contains functions to mask credit card form fields.

## API

### `maskField( fieldName, previousValue, nextValue )`

Returns a masked input value for the given field based on the current value and the next value to replace it with.

### `unmaskField( fieldName, previousValue, nextValue )`

Returns an unmasked input value that is meant to be used within the program rather than displayed to the user.