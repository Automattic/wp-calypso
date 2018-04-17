checkout validation and API
-------------------

This module contains functions to validate and mask credit card form fields.

## API

### `validatePaymentDetails( paymentDetails )`

Returns an object containing the errors for each field. For example the returned object might look like this:

```js
{ number: [ 'Invalid credit card' ] }
```

If there are any missing fields, there are no errors for that field.

### `getCreditCardType( number )`

