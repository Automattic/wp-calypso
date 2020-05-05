# Composite Checkout

A set of React components, custom Hooks, and helper functions that together can be used to create a purchase and checkout flow.

## Installation

**This package is still in development and not yet published.**

Once published, you'll be able to install this package using npm with:

`yarn add @automattic/composite-checkout`

## Description

This package provides a context provider, `CheckoutProvider`, a default component, `Checkout`, and the `CheckoutStepArea` component which creates a checkout form.

The form has two default steps:

1. Payment method
2. Review order

These steps can be customized or replaced, and additional steps can be added.

It's also possible to build an entirely custom form using the other components exported by this package.

## How to use this package

Most components of this package require being inside a [CheckoutProvider](#checkoutprovider). That component requires an array of [Payment Method objects](#payment-methods) which define the available payment methods (stripe credit cards, apple pay, paypal, credits, etc.) that will be displayed in the form. While you can create these objects manually, the package provides many pre-defined payment method objects that can be created by using the following functions:
 - [createApplePayMethod](#createapplepaymethod)
 - [createExistingCardMethod](#createExistingCardMethod)
 - [createFullCreditsMethod](#createFullCreditsMethod)
 - [createPayPalMethod](#createpaypalmethod)
 - [createStripeMethod](#createstripemethod)

Any component which is a child of `CheckoutProvider` gets access to the following custom hooks:
 - [useAllPaymentMethods](#useAllPaymentMethods)
 - [useEvents](#useEvents)
 - [useFormStatus](#useFormStatus)
 - [useMessages](#useMessages)
 - [useDispatch](#useDispatch)
 - [useLineItems](#useLineItems)
 - [useLineItemsOfType](#useLineItemsOfType)
 - [usePaymentMethod](#usePaymentMethodId)
 - [usePaymentMethodId](#usePaymentMethodId)
 - [useRegisterStore](#useRegisterStore)
 - [useRegistry](#useRegistry)
 - [useSelect](#useSelect)
 - [useTotal](#useTotal)

The [Checkout](#checkout) component creates a wrapper for Checkout. Within the component you can render any children to create the checkout experience, but a few components are provided to make this easier:
 - [CheckoutSummaryArea](#CheckoutSummaryArea) (optional) can be used to render an invisible area that, by default, floats beside the checkout steps on larger screens and collapses behind a toggle at the top of smaller screens.
 - [CheckoutSummaryCard](#CheckoutSummaryCard) (optional) can be used inside CheckoutSummaryArea to render a bordered area.
 - [CheckoutStepArea](#CheckoutStepArea) (required) supplies a styled wrapper for the CheckoutStepBody and CheckoutStep components, and creates the Checkout form itself with a submit button.
 - [CheckoutStepBody](#CheckoutStepBody) (optional) can be used to render something that looks like a checkout step. A series of these can be used to create a semantic form.
 - [CheckoutSteps](#CheckoutSteps) (with [CheckoutStep](#CheckoutStep) children) can be used to create a series of steps that are joined by "Continue" buttons which are hidden and displayed as needed.
 - [CheckoutStep](#CheckoutStep) (optional) children of `CheckoutSteps` can be used to create a series of steps that are joined by "Continue" buttons which are hidden and displayed as needed.

Each `CheckoutStep` has an `isCompleteCallback` prop, which will be called when the "Continue" button is pressed. It can perform validation on that step's contents to determine if the form should continue to the next step. If the function returns true, the form continues to the next step, otherwise it remains on the same step. If the function returns a `Promise`, then the "Continue" button will change to "Please wait…" until the Promise resolves allowing for async operations. The value resolved by the Promise must be a boolean; true to continue, false to stay on the current step.

Any component within a `CheckoutStep` gets access to the custom hooks above as well as [useIsStepActive](#useIsStepActive) and [useIsStepComplete](#useIsStepComplete).

## Submitting the form

When the payment button is pressed, the form data will be validated and submitted in a way appropriate to the payment method. If there is a problem with either validation or submission, or if the payment method's service returns an error, the `showErrorMessage` prop on `Checkout` will be called with an object describing the error.

If the payment method succeeds, the `onPaymentComplete` prop will be called instead.

## Example

See the [demo](demo/index.js) for an example of using this package.

## Styles and Themes

Each component will be styled using [@emotion/styled](https://emotion.sh/docs/styled) and many of the styles will be editable by passing a `theme` object to the `CheckoutProvider`.

For style customization beyond what is available in the theme, each component will also include a unique static className using BEM syntax.

When using the individual API components, you can also pass a `className` prop, which will be applied to that component in addition to the above.

## Payment Methods

Each payment method is an object with the following properties:

- `id: string`. A unique id.
- `label: React.ReactNode`. A component that displays that payment method selection button which can be as simple as the name and an icon.
- `activeContent: React.ReactNode`. A component that displays that payment method (this can return null or something like a credit card form).
- `submitButton: React.ReactNode`. A component button that is used to submit the payment method. This button should include a click handler that performs the actual payment process. When disabled, it will be provided with the `disabled` prop and must disable the button.
- `inactiveContent: React.ReactNode`. A component that renders a summary of the selected payment method when the step is inactive.
- `getAriaLabel: (localize: () => string) => string`. A function to return the name of the Payment Method. It will receive the localize function as an argument.

Within the components, the Hook `usePaymentMethod()` will return an object of the above form with the key of the currently selected payment method or null if none is selected. To retrieve all the payment methods and their properties, the Hook `useAllPaymentMethods()` will return an array that contains them all.

When the `submitButton` component has been clicked, it should use the functions provided by [useFormStatus](#useFormStatus) to change the status to 'submitting'. If there is a problem, it should change the status back to 'ready' and display an appropriate error using [useMessages](#useMessages). If the payment is successful, it should change the status to 'complete', which will cause [Checkout](#Checkout) to call `onPaymentComplete` (see [CheckoutProvider](#CheckoutProvider)).

## Line Items

Each item is an object with the following properties:

- `id: string`. A unique identifier for this line item within the array of line items. Do not use the product id; never assume that only one instance of a particular product is present.
- `type: string`. Not used internally but can be used to organize line items (eg: `tax` for a VAT line item).
- `label: string`. The displayed title of the line item.
- `subLabel?: string`. An optional subtitle for the line item.
- `amount: { currency: string, value: number, displayValue: string }`. The price of the line item. For line items without a price, set value to 0 and displayValue to an empty string.

The `displayValue` property can use limited Markdown formatting, including the `~~` characters for strike-through text. When rendering `displayValue`, the property should be passed through the `renderDisplayValueMarkdown()` helper.

## Data Stores

Each Payment Method or component can create a Redux-like data store by using the `registerStore` function. Code can then access that data by using `dispatch`, `select`, and `subscribe`. These functions can be accessed by calling the `useRegistry` hook. Components can most easily use the data with the `useDispatch` and `useSelect` hooks. Read the [@wordpress/data](https://wordpress.org/gutenberg/handbook/packages/packages-data/) docs to learn more about the details of this system.

In addition to the features of that package, we provide a `useRegisterStore` hook which takes the same arguments as `registerStore` and will allow creating a new store just before a component first renders.

The registry used for these stores is created by default but you can use a custom one by including the `registry` prop on `CheckoutProvider`. If you want to use the default registry, you can import it directly from this package using [#defaultRegistry](defaultRegistry), and for convenience, [#registerStore](registerStore).

## API

While the `Checkout` component takes care of most everything, there are many situations where its appearance and behavior will be customized. In these cases it's appropriate to use the underlying building blocks of this package.

### Checkout

The main wrapper component for Checkout. It has the following props.

- `className?: string`. The className for the component.

### CheckoutProvider

Renders its `children` prop and acts as a React Context provider. All of checkout should be wrapped in this.

It has the following props.

- `locale: string`. A [BCP 47 language tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument).
- `items: object[]`. An array of [line item objects](#line-items) that will be displayed in the form.
- `total: object`. A [line item object](#line-items) with the final total to be paid.
- `theme?: object`. A [theme object](#styles-and-themes).
- `onPaymentComplete: ({paymentMethodId: string}) => null`. A function to call for non-redirect payment methods when payment is successful. Passed the current payment method id.
- `showErrorMessage: (string) => null`. A function that will display a message with an "error" type.
- `showInfoMessage: (string) => null`. A function that will display a message with an "info" type.
- `showSuccessMessage: (string) => null`. A function that will display a message with a "success" type.
- `onEvent?: (action) => null`. A function called for all sorts of events in the code. The callback will be called with a [Flux Standard Action](https://github.com/redux-utilities/flux-standard-action).
- `paymentMethods: object[]`: An array of [Payment Method objects](#payment-methods).
- `registry?: object`. An object returned by [createRegistry](#createRegistry). If not provided, the default registry will be used.
- `isLoading?: boolean`. If set and true, the form will be replaced with a loading placeholder and the form status will be set to 'loading' (see [useFormStatus](#useFormStatus)).
- `isValidating?: boolean`. If set and true, the form status will be set to 'validating' (see [useFormStatus](#useFormStatus)).

The line items are for display purposes only. They should also include subtotals, discounts, and taxes. No math will be performed on the line items. Instead, the amount to be charged will be specified by the required prop `total`, which is another line item.

### CheckoutReviewOrder

Renders a list of the line items and their `displayValue` properties followed by the `total` line item, and whatever `submitButton` is in the current payment method.

## CheckoutStep

A checkout step. This should be a direct child of [CheckoutSteps](#CheckoutSteps) and is itself a wrapper for [CheckoutStepBody](#CheckoutStepBody). If you want to make something that looks like a step but is not connected to other steps, use a [CheckoutStepBody](#CheckoutStepBody) instead.

This component's props are:

- `stepId: string`. A unique ID for the step.
- `className?: string`. A className for the step wrapper.
- `titleContent: React.ReactNode`. Displays as the title of the step.
- `activeStepContent?: React.ReactNode`. Displays as the content of the step when it is active. It is also displayed when the step is inactive but is hidden by CSS.
- `completeStepContent?: React.ReactNode`. Displays as the content of the step when it is inactive and complete as defined by the `isCompleteCallback`.
- `isCompleteCallback: () => boolean | Promise<boolean>`. Used to determine if a step is complete for purposes of validation. Note that this is not called for the last step!
- `editButtonAriaLabel?: string`. Used to fill in the `aria-label` attribute for the "Edit" button if one exists.
- `nextStepButtonAriaLabel?: string`. Used to fill in the `aria-label` attribute for the "Continue" button if one exists.
- `editButtonText?: string`. Used in place of "Edit" on the edit step button.
- `nextStepButtonText?: string`. Used in place of "Continue" on the next step button.
- `validatingButtonText?: string`. Used in place of "Please wait…" on the next step button when `isCompleteCallback` returns an unresolved Promise.
- `validatingButtonAriaLabel:? string`. Used for the `aria-label` attribute on the next step button when `isCompleteCallback` returns an unresolved Promise.

## CheckoutArea

Creates the Checkout form and provides a wrapper for [CheckoutStep](#CheckoutStep) and [CheckoutStepBody](#CheckoutStepBody) objects. Should be a direct child of [Checkout](#Checkout).

## CheckoutStepBody

A component that looks like a checkout step. Normally you don't need to use this directly, since [CheckoutStep](#CheckoutStep) creates this for you, but you can use it manually if you wish.

- `stepId: string`. A unique ID for this step.
- `isStepActive: boolean`. True if the step should be rendered as active. Renders `activeStepContent`.
- `isStepComplete: boolean`. True if the step should be rendered as complete. Renders `completeStepContent`.
- `stepNumber: number`. The step number to display for the step.
- `totalSteps: number`. The total number of steps in the current connected group of steps.
- `errorMessage?: string`. The error message to display in the React error boundary if there is an error thrown by any component in this step.
- `onError?: (error: Error) => void`. A callback to be called from the React error boundary if there is an error thrown by any component in this step.
- `editButtonText?: string`. The text to display instead of "Edit" for the edit step button.
- `editButtonAriaLabel?: string`. The text to display for `aria-label` instead of "Edit" for the edit step button.
- `nextStepButtonText?: string`. Like `editButtonText` but for the "Continue" button.
- `nextStepButtonAriaLabel?: string`. Like `editButtonAriaLabel` but for the "Continue" button.
- `validatingButtonText?: string`. Like `editButtonText` but for the "Please wait…" button when `formStatus` is `validating`.
- `validatingButtonAriaLabel?: string`. Like `editButtonAriaLabel` but for the "Please wait…" button.
- `className?: string`. A className for the component.
- `goToThisStep?: () => void`. A function to be called when the "Edit" button is pressed.
- `goToNextStep?: () => void`. A function to be called when the "Continue" button is pressed.
- `nextStepNumber?: number`. The step number of the step that will be active after the "Continue" button is pressed.
- `formStatus?: string`. The current form status. See [useFormStatus](#useFormStatus).
- `titleContent: React.ReactNode`. Displays as the title of the step.
- `activeStepContent?: React.ReactNode`. Displays as the content of the step when it is active. It is also displayed when the step is inactive but is hidden by CSS.
- `completeStepContent?: React.ReactNode`. Displays as the content of the step when it is inactive and complete as defined by `isStepComplete` and `isStepActive`.

## CheckoutSteps

A wrapper for [CheckoutStep](#CheckoutStep) objects that will connect the steps and provide a way to switch between them. Should be a direct child of [Checkout](#Checkout).

### CheckoutSummaryArea

Renders its `children` prop and acts as a wrapper to flow outside of the [`CheckoutSteps`](#CehckoutSteps) wrapper (floated on desktop, collapsed on mobile). It has the following props.

- `className?: string`. The className for the component.

### CheckoutSummaryCard

Can be used inside [CheckoutSummaryArea](#CheckoutSummaryArea) to render a bordered area.

### OrderReviewLineItems

Renders a list of line items passed in the `items` prop. Each line item must have at least the props `label`, `id`, and `amount.displayValue`.

An optional boolean prop, `collapsed`, can be used to simplify the output for when the review section is collapsed.

This component provides just a simple list of label and price. If you want to modify how each line item is displayed, or if you want to provide any actions for that item (eg: the ability to delete the item from the order), you cannot use this component; instead you should create a custom component.

### OrderReviewSection

A wrapper for a section of a list of related line items. Renders its `children` prop.

### OrderReviewTotal

Renders the `total` prop like a line item, but with different styling.

An optional boolean prop, `collapsed`, can be used to simplify the output for when the review section is collapsed.

### createApplePayMethod

Creates a [Payment Method](#payment-methods) object. Requires passing an object with the following properties:

- `registerStore: object => object`. The `registerStore` function from the return value of [createRegistry](#createRegistry).
- `fetchStripeConfiguration: async ?object => object`. An async function that fetches the stripe configuration (we use Stripe for Apple Pay).
- `submitTransaction: async object => object`. An async function that sends the request to the endpoint.
- `getCountry: () => string`. A function that returns the country to use for the transaction.
- `getPostalCode: () => string`. A function that returns the postal code for the transaction.

### createRegistry

Creates a [data store](#data-stores) registry to be passed (optionally) to [CheckoutProvider](#checkoutprovider). See the `@wordpress/data` [docs for this function](https://developer.wordpress.org/block-editor/packages/packages-data/#createRegistry).

### createExistingCardMethod

Creates a [Payment Method](#payment-methods) object for an existing credit card. Requires passing an object with the following properties:

- `registerStore: object => object`. The `registerStore` function from the return value of [createRegistry](#createRegistry).
- `submitTransaction: async ?object => object`. An async function that sends the request to the endpoint process the payment.
- `getCountry: () => string`. A function that returns the country to use for the transaction.
- `getPostalCode: () => string`. A function that returns the postal code for the transaction.
- `getSubdivisionCode: () => string`. A function that returns the subdivision code for the transaction.
- `id: string`. A unique id for this payment method (since there are likely to be several existing cards).
- `cardholderName: string`. The cardholder's name. Used for display only.
- `cardExpiry: string`. The card's expiry date. Used for display only.
- `brand: string`. The card's brand (eg: `visa`). Used for display only.
- `last4: string`. The card's last four digits. Used for display only.

### createFullCreditsMethod

Creates a [Payment Method](#payment-methods) object for credits. Requires passing an object with the following properties:

- `registerStore: object => object`. The `registerStore` function from the return value of [createRegistry](#createRegistry).
- `submitTransaction: async ?object => object`. An async function that sends the request to the endpoint process the payment.
- `creditsDisplayValue: string`. The amount of credits to display as a readable string.
- `label?: React.ReactNode`. An optional label React element to use in the payment method.
- `buttonText?: string`. An optional string to display in the payment button.

### createPayPalMethod

Creates a [Payment Method](#payment-methods) object. Requires passing an object with the following properties:

- `registerStore: object => object`. The `registerStore` function from the return value of [createRegistry](#createRegistry).

The object returned by this function **must have** the following property added to it:

- `submitTransaction: async object => string`. An async function that sends the request to the endpoint to get the redirect url.

### createStripeMethod

Creates a [Payment Method](#payment-methods) object. Requires passing an object with the following properties:

- `registerStore: object => object`. The `registerStore` function from the return value of [createRegistry](#createRegistry).
- `submitTransaction: async object => object`. An async function that sends the request to the endpoint.
- `getCountry: () => string`. A function that returns the country to use for the transaction.
- `getPostalCode: () => string`. A function that returns the postal code for the transaction.
- `getSubdivisionCode: () => string`. A function that returns the subdivision code for the transaction.
- `stripe: object`. The configured stripe object.
- `stripeConfiguration: object`. The stripe configuration object.

### defaultRegistry

The default registry. See [#data-stores](Data Stores) for more details.

### getDefaultOrderReviewStep

Returns a step object whose properties can be added to a [CheckoutStep](CheckoutStep) (and customized) to display an itemized order review.

### getDefaultOrderSummaryStep

Returns a step object whose properties can be added to a [CheckoutStep](CheckoutStep) (and customized) to display a brief order summary.

### getDefaultPaymentMethodStep

Returns a step object whose properties can be added to a [CheckoutStep](CheckoutStep) (and customized) to display a way to select a payment method. The payment methods displayed are those provided to the [CheckoutProvider](#checkoutprovider).

### registerStore

The `registerStore` function on the [#defaultRegistry](default registry). Don't use this if you create a custom registry.

### formatValueForCurrency

Takes two arguments, a currency string and an integer string and returns the locale-specific string displayValue. For example, the arguments (`USD`, `6000`) would return the string `$60.00`.

### renderDisplayValueMarkdown

Takes one argument, a displayValue string, and returns the displayValue with some minor Markdown formatting. Specifically, the `~~` characters can be used to make ~~strike-through~~ text.

### useAllPaymentMethods

A React Hook that will return an array of all payment method objects. See `usePaymentMethod()`, which returns the active object only. Only works within [CheckoutProvider](#CheckoutProvider).

### useDispatch

A React Hook that will return all the bound action creators for a [Data store](#data-stores). Only works within [CheckoutProvider](#CheckoutProvider).

### useEvents

A React Hook that will return the `onEvent` callback as passed to `CheckoutProvider`. Only works within [CheckoutProvider](#CheckoutProvider).

### useFormStatus

A React Hook that will return an object with the following properties:

- `formStatus: string`. The current status of the form; one of 'loading', 'ready', 'validating', 'submitting', or 'complete'.
- `setFormReady: () => void`. Function to change the form status to 'ready'.
- `setFormLoading: () => void`. Function to change the form status to 'loading'.
- `setFormValidating: () => void`. Function to change the form status to 'validating'.
- `setFormSubmitting: () => void`. Function to change the form status to 'submitting'.
- `setFormComplete: () => void`. Function to change the form status to 'complete'. Note that this will trigger `onPaymentComplete` from [CheckoutProvider](#CheckoutProvider).

Only works within [CheckoutProvider](#CheckoutProvider) which may sometimes change the status itself based on its props.

### useIsStepActive

A React Hook that will return true if the current step is the currently active step. Only works within a step.

### useIsStepComplete

A React Hook that will return true if the current step is complete as defined by the `isCompleteCallback` of that step. Only works within a step.

### useLineItems

A React Hook that will return a two element array where the first element is the current array of line items (matching the `items` from the `CheckoutProvider`), and the second element is the current total (matching the `total` from the `CheckoutProvider`). Only works within [CheckoutProvider](#CheckoutProvider).

### useLineItemsOfType

A React Hook taking one string argument that will return an array of [line items](#line-items) from the cart (derived from the same data returned by [useLineItems](#useLineItems)) whose `type` property matches that string. Only works within [CheckoutProvider](#CheckoutProvider).

### useMessages

A React Hook that will return an object containing the `showErrorMessage`, `showInfoMessage`, and `showSuccessMessage` callbacks as passed to `CheckoutProvider`. Only works within [CheckoutProvider](#CheckoutProvider).

### usePaymentMethod

A React Hook that will return an object containing all the information about the currently selected payment method (or null if none is selected). The most relevant property is probably `id`, which is a string identifying whatever payment method was entered in the payment method step. Only works within [CheckoutProvider](#CheckoutProvider).

### usePaymentMethodId

A React Hook that will return a two element array. The first element is a string representing the currently selected payment method (or null if none is selected). The second element is a function that will replace the currently selected payment method. Only works within [CheckoutProvider](#CheckoutProvider).

### useRegisterStore

A React Hook that can be used to create a @wordpress/data store. This is the same as calling `registerStore()` but is easier to use within functional components because it will only create the store once. Only works within [CheckoutProvider](#CheckoutProvider).

### useRegistry

A React Hook that returns the `@wordpress/data` registry being used. Only works within [CheckoutProvider](#CheckoutProvider).

### useSelect

A React Hook that accepts a callback which is provided the `select` function from the [Data store](#data-stores). The `select()` function can be called with the name of a store and will return the bound selectors for that store. Only works within [CheckoutProvider](#CheckoutProvider).

### useTotal

A React Hook that returns the `total` property provided to the [CheckoutProvider](#checkoutprovider). This is the same as the second return value of [useLineItems](#useLineItems) but may be more semantic in some cases. Only works within `CheckoutProvider`.

## FAQ

### How do I use Credits and Coupons?

Credits, coupons, and discounts are all ways that the line items and the total can be modified, so they must be handled by the parent component.

### Do line items need to be products?

No, line items can be anything. The most common use is for products, taxes, subtotals, discounts, and other adjustments to the total price. However, line items can also contain other information that you'd like to display in the review step. If you customize the Order Review step, you will also be able to decide how each line item is presented. Just be aware that line items may be passed along to the server when the purchase is made, depending on the payment method. Check the documentation for each payment method to determine if there are any specific requirements there.

### Do line items amount properties have to have an integer value?

The primary properties used in a line item by default are `id` (which must be unique), `label` (with an optional `subLabel`), and `amount.displayValue`. The other properties (`type`, `amount.currency`, `amount.value`) are not used outside custom implementations, but it's highly recommended that you provide them. As requirements and customizations change, it can be helpful to have a way to perform calculations, conversions, and sorting on line items, which will require those fields. If any required field is undefined, an error will be thrown to help notice these errors as soon as possible.

### Can I add custom properties to line items?

If you need specific custom data as part of a line item so that it can be used in another part of the form, you can add new properties to the line item objects.

## Development

In the root of the monorepo, run `yarn run composite-checkout-demo` which will start a local webserver that will display the component.

To run the tests for this package, run `yarn run test-packages composite-checkout`.
