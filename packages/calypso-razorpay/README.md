# Calypso Razorpay

This is a library of components and functions for using Razorpay for credit card processing in Calypso.

## RazorpayHookProvider

You'll need to wrap this context provider around any component that wishes to use `useRazorpay`. It accepts the following props:

- `children: React.ReactNode`
- `fetchRazorpayConfiguration: GetRazorpayConfiguration` A function to fetch the razorpay configuration from the WP.com HTTP API.

## useRazorpay

A React hook that allows access to Razorpay.js. This returns an object with the following properties:

- `razorpayConfiguration: null | RazorpayConfiguration` The object containing the data returned by the wpcom razorpay configuration endpoint. Consumers can use this to instantiate a Razorpay object.
- `isRazorpayLoading: boolean` A boolean that is true if the razorpay configuration is currently being loaded.
- `razorpayLoadingError: undefined | null | Error` An optional object that will be set if there is an error loading the razorpay configuration.

The hook does not provide an instantiated Razorpay object because doing so properly requires an Order ID, the existence of which is negotiated during the order flow. That is, we first initiate a transaction, returning a razorpay order ID negotiated between the backend and Razorpay, and then on the frontend initialize the Razorpay object which handles opening the modal with that order ID.
