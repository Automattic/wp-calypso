Payment State
=============

A module for managing state associated with payment information.

## Actions

### `setPaymentCountryCode( countryCode: String )`

Stores the two-letter code which represents the country that is currently used as the default payment and billing country across the site.

## Reducers

The included reducers add the following keys to the global state tree, under `ui.payment`:

### `countryCode`

The two-letter code which represents the country that is currently used as the default payment and billing country across the site, or `null` if there is none.

## Selectors

The following selectors are provided to assist in extracting data from the global state tree for consumption by other modules:

### `getPaymentCountryCode( state: Object )`

Returns the two-letter code which represents the country that is currently used as the default payment and billing country across the site, or `null` if there is none.
