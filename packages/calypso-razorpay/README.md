# Calypso Razorpay

This is a library of components and functions for using Razorpay for credit card processing in Calypso.

## RazorpayHookProvider

You'll need to wrap this context provider around any component that wishes to use `useRazorpay`. It accepts the following props:

- `children: React.ReactNode`
- `fetchRazorpayConfiguration: GetRazorpayConfiguration` A function to fetch the razorpay configuration from the WP.com HTTP API.

## useRazorpay

A React hook that allows access to Razorpay.js. This returns an object with the following properties:

- `razorpay: Razorpay` The instance of the razorpay library.
- `razorpayConfiguration: null | RazorpayConfiguration` The object containing the data returned by the wpcom razorpay configuration endpoint.
- `isRazorpayLoading: boolean` A boolean that is true if razorpay is currently being loaded.
- `razorpayLoadingError: undefined | null | Error` An optional object that will be set if there is an error loading razorpay.
