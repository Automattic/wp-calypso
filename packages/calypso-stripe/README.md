# Calypso Stripe

This is a library of components and functions for using Stripe for credit card processing in Calypso.

This uses [Stripe elements](https://stripe.com/payments/elements).

## StripeHookProvider

You'll need to wrap this context provider around any component that wishes to use `useStripe` or `withStripeProps`. It accepts the following props:

- `children: React.ReactNode`
- `fetchStripeConfiguration: GetStripeConfiguration` A function to fetch the stripe configuration from the WP.com HTTP API.
- `configurationArgs?: null | GetStripeConfigurationArgs` Options to pass to the fetchStripeConfiguration function, specifically `country`.
- `locale?: string` An optional locale string used to localize error messages for the Stripe elements fields.

## StripeSetupIntentIdProvider

You'll need to wrap this context provider around any component that wishes to use `useStripeSetupIntentId`. It accepts the following props:

- `children: React.ReactNode`
- `fetchStripeSetupIntentId: GetStripeSetupIntentId` A function to fetch the stripe setup intent from the WP.com HTTP API.
- `isDisabled?: boolean` An option to disable the fetching of the setup intent if it is not needed.

## useStripe

A React hook that allows access to Stripe.js. This returns an object with the following properties:

- `stripe: null | Stripe` The instance of the stripe library.
- `stripeConfiguration: null | StripeConfiguration` The object containing the data returned by the wpcom stripe configuration endpoint. May include a payment intent.
- `isStripeLoading: boolean` A boolean that is true if stripe is currently being loaded.
- `stripeLoadingError: undefined | null | Error` An optional object that will be set if there is an error loading stripe.

## useStripeSetupIntentId

A React hook that allows access to creating a setup intent ID that can be passed to createStripeSetupIntent. This returns an object with the following properties:

- `setupIntentId: string | undefined`. The setup intent ID.
- `error: undefined | null | Error`. An error, if one exists.
- `reload: () => void`. A function that can be used to reload the setupIntentId, which should be done if it is used at all (even if it fails).

## createStripeSetupIntent

A function that can be used to create a Stripe setup intent with a setup intent ID and a Stripe credit card field.

## withStripeProps

A higher-order-component function for use when using `useStripe` is not possible. Provides the same data as returned by `useStripe` as props to a component.
