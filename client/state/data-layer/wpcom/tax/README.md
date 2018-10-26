Tax Middleware
==================

The tax middleware monitors the values of the payment country and postcode, and
fetches a tax rate from the API when both are valid and supported.

As this involves several of our most complicated old stores, this middleware
leverages `lib/redux-bridge` in order to listen to actions coming from both
Redux and Flux, but results are always stored in the redux.