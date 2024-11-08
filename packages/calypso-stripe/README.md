# Calypso Stripe

This is a library of components and functions for using Stripe for credit card processing in Calypso.

This uses [Stripe elements](https://stripe.com/payments/elements).

## StripeHookProvider

You'll need to wrap this context provider around any component that wishes to use `useStripe` or `withStripeProps`. It accepts the following props:

- `children: React.ReactNode`
- `fetchStripeConfiguration: GetStripeConfiguration` A function to fetch the stripe configuration from the WP.com HTTP API.
- `locale?: string` An optional locale string used to localize error messages for the Stripe elements fields.
- `country?: string` An optional country string used to determine which Stripe account to use. If not provided, the country will be detected based on Geo IP.

## useStripe

A React hook that allows access to Stripe.js. This returns an object with the following properties:

- `stripe: null | Stripe` The instance of the stripe library.
- `stripeConfiguration: null | StripeConfiguration` The object containing the data returned by the wpcom stripe configuration endpoint. May include a payment intent.
- `isStripeLoading: boolean` A boolean that is true if stripe is currently being loaded.
- `stripeLoadingError: undefined | null | Error` An optional object that will be set if there is an error loading stripe.

## confirmStripeSetupIntentAndAttachCard

A function that can be used to confirm a Stripe setup intent with a setup intent ID and a Stripe credit card field. The setup intent itself must have already been created, typically without a payment method attached. This function will create and attach the credit card as a payment method to the setup intent.

## withStripeProps

A higher-order-component function for use when using `useStripe` is not possible. Provides the same data as returned by `useStripe` as props to a component.

## loadStripeLibrary

Loads the Stripe.js library directly.

Unlike `StripeHookProvider` and `useStripe`, this does not keep any state, so try not to call it too often.

This can be useful when you need a different stripe object (eg: for a different country) than the one in `StripeHookProvider`, or if you cannot easily use the provider.

If `country` is provided, it will be used to determine which Stripe account to load. If `paymentPartner` is provided, it will be used instead. If neither is provided, the geolocation will be used.
