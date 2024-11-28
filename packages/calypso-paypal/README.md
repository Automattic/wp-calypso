# Calypso PayPal

This is a library of components and functions for using PayPal for credit card processing in Calypso.

It is a wrapper for the `PayPalScriptProvider` from `@paypal/react-paypal-js` that handles getting the client key from our configuration endpoint.

## PayPalProvider

You'll need to wrap this context provider around any component that wishes to use components from `@paypal/react-paypal-js` like `PayPalButtons`.
