# Calypso Stripe

This is a library of components and functions for using Stripe for credit card processing in Calypso.

This uses [Stripe elements](https://stripe.com/payments/elements), but with [an older version of the npm package](https://github.com/stripe/react-stripe-elements). We plan to migrate to [the newer version](https://github.com/stripe/react-stripe-js) eventually.

## StripeHookProvider

You'll need to wrap this context provider around any component that wishes to use `useStripe` or `withStripeProps`. It accepts the following props:

- `children: JSX.Element`
- `fetchStripeConfiguration: GetStripeConfiguration` A function to fetch the stripe configuration from the WP.com HTTP API.
- `configurationArgs?: undefined | null | GetStripeConfigurationArgs` Options to pass to the fetchStripeConfiguration function, specifically `country` and/or `needs_intent`, the latter of which can be used to request a payment intent for adding a new card without a purchase.
- `locale?: undefined | string` An optional locale string used to localize error messages for the Stripe elements fields.

## useStripe

A React hook that allows access to Stripe.js. This returns an object with the following properties:

- `stripe: null | Stripe` The instance of the stripe library.
- `stripeConfiguration: null | StripeConfiguration` The object containing the data returned by the wpcom stripe configuration endpoint. May include a payment intent.
- `isStripeLoading: boolean` A boolean that is true if stripe is currently being loaded.
- `stripeLoadingError: undefined | null | Error` An optional object that will be set if there is an error loading stripe.
- `reloadStripeConfiguration: ReloadStripeConfiguration` A function that can be called with a value to force the stripe configuration to reload.

## withStripeProps

A higher-order-component function for use when using `useStripe` is not possible. Provides the same data as returned by `useStripe` as props to a component.
