# Composite Checkout

A set of React components, custom Hooks, and helper functions that together can be used to create a purchase and checkout flow.

## Installation

**This package is still in development and not yet published.**

Once published, you'll be able to install this package using npm with:

`npm install @automattic/composite-checkout`

## Description

This package provides a context provider, `CheckoutProvider`, and a default component, `Checkout`, which creates a checkout form.

The form has two default steps:

1. Payment method
2. Review order

These steps can be customized or replaced, and additional steps can be added.

It's also possible to build an entirely custom form using the other components exported by this package.

## How to use this package

Most components of this package require being inside a [CheckoutProvider](#checkoutprovider). That component requires an array of [Payment Method objects](#payment-methods) which define the available payment methods (stripe credit cards, apple pay, paypal, credits, etc.) that will be displayed in the form. While you can create these objects manually, the package provides many pre-defined payment method objects that can be created by using the functions [createStripeMethod](#createstripemethod), [createApplePayMethod](#createapplepaymethod), [createPayPalMethod](#createpaypalmethod), and [createExistingCardMethod](#createExistingCardMethod).

Any component which is a child of `CheckoutProvider` gets access to the custom hooks [useAllPaymentMethods](#useAllPaymentMethods), [useEvents](#useEvents), [useFormStatus](#useFormStatus), [useMessages](#useMessages), [useCheckoutRedirects](#useCheckoutRedirects), [useDispatch](#useDispatch), [useLineItems](#useLineItems), [usePaymentData](#usePaymentData), [usePaymentMethod](#usePaymentMethodId), [usePaymentMethodId](#usePaymentMethodId), [useRegisterStore](#useRegisterStore), [useRegistry](#useRegistry), [useSelect](#useSelect), and [useTotal](#useTotal).

The [Checkout](#checkout) component creates the form itself. That component displays a series of steps which are passed in as [Step objects](#steps). While you can create these objects manually, the package provides three pre-defined steps that can be created by using the functions [getDefaultOrderSummaryStep](#getDefaultOrderSummaryStep), [getDefaultPaymentMethodStep](#getDefaultPaymentMethodStep), and [getDefaultOrderReviewStep](#getDefaultOrderReviewStep).

Any component within a Step object gets access to the custom hooks above as well as [useActiveStep](#useActiveStep), and [useIsStepActive](#useIsStepActive).

## Submitting the form

When the payment button is pressed, the form data will be validated and submitted in a way appropriate to the payment method. If there is a problem with either validation or submission, or if the payment method's service returns an error, the `showErrorMessage` prop on `Checkout` will be called with an object describing the error.

If the payment method succeeds, the `onPaymentComplete` prop will be called instead.

Some payment methods may require a redirect to an external site. If that occurs, the `failureRedirectUrl` and `successRedirectUrl` props on `Checkout` will be used instead of the `showErrorMessage` and `onPaymentComplete` callbacks. All four props are required.

## Steps

The `Checkout` component accepts an optional `steps` prop which is an array of Step objects. Each Step is an object with properties that include both React elements to display at certain times as well as metadata about how the step should be displayed. Here's an example step:

```js
{
	id: 'payment-method',
	className: 'checkout__payment-methods-step',
	hasStepNumber: true,
	titleContent: <CheckoutPaymentMethodsTitle />,
	activeStepContent: <CheckoutPaymentMethods isComplete={ false } />,
	incompleteStepContent: null,
	completeStepContent: <CheckoutPaymentMethods summary isComplete={ true } />,
	isCompleteCallback: ( { paymentData } ) => {
		const { billing = {} } = paymentData;
		if ( ! billing.country ) {
			return false;
		}
		return true;
	},
	isEditableCallback: ( { paymentData } ) => {
		return ( paymentData.billing ) ? true : false;
	},
	getEditButtonAriaLabel: () => translate( 'Edit the payment method' ),
	getNextStepButtonAriaLabel: () => translate( 'Continue with the selected payment method' ),
}
````

All properties except for `id` are optional.

- `id: string`. A unique ID for the step.
- `className?: string`. Displayed on the step wrapper.
- `hasStepNumber?: boolean`. If false, the step will not have a number displayed and will never be made active. Can be used for informational blocks. Defaults to false.
- `titleContent?: React.ReactNode`. Displays as the title of the step. This can be be variable based on form status by using hooks like `useActiveStep()` to see if the step is active.
- `activeStepContent?: React.ReactNode`. Displays as the content of the step when it is active. It is also displayed when the step is inactive but is hidden by CSS.
- `incompleteStepContent?: React.ReactNode`. Displays as the content of the step when it is inactive and incomplete as defined by the `isCompleteCallback`. It is also displayed when the step is active but is hidden by CSS.
- `completeStepContent?: React.ReactNode`. Displays as the content of the step when it is inactive and complete as defined by the `isCompleteCallback`. It is also displayed when the step is active but is hidden by CSS.
- `isCompleteCallback?: ({paymentData: object, activeStep: object}) => boolean`. Used to determine if a step is complete for purposes of validation. Default is a function returning false.
- `isEditableCallback?: ({paymentData: object}) => boolean`. Used to determine if an inactive step should display an "Edit" button. Default is a function returning false.
- `getEditButtonAriaLabel?: () => string`. Used to fill in the `aria-label` attribute for the "Edit" button if one exists.
- `getNextStepButtonAriaLabel?: () => string`. Used to fill in the `aria-label` attribute for the "Continue" button if one exists.

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
- `CheckoutWrapper?: React.Component`. A component that wraps the whole of the checkout form. This can be used for custom data providers (eg: `StripeProvider`).
- `getAriaLabel: (localize: () => string) => string`. A function to return the name of the Payment Method. It will receive the localize function as an argument.
- `isCompleteCallback?: ({paymentData: object, activeStep: object}) => boolean`. Used to determine if a step is complete for purposes of validation. Default is a function returning true.

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

The registry used for these stores is created by default in `CheckoutProvider` but you can use a custom one by including the `registry` prop on that component.

## API

While the `Checkout` component takes care of most everything, there are many situations where its appearance and behavior will be customized. In these cases it's appropriate to use the underlying building blocks of this package.

### Checkout

The main component in this package. It has the following props.

- `steps: array`. See the [Steps](#steps) section above for more details.

### CheckoutNextStepButton

Renders a button to move to the next `CheckoutStep` component. Its `value` prop can be used to customize the text which by default will be "Continue".

### CheckoutPaymentMethods

Renders buttons for each payment method that can be used. The `onChange` callback prop can be used to determine which payment method has been selected. When the `isComplete` prop is true and `isActive` is false, it will display a summary of the current choice.

### CheckoutProvider

Renders its `children` prop and acts as a React Context provider. All of checkout should be wrapped in this.

It has the following props.

- `locale: string`. A [BCP 47 language tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument).
- `items: object[]`. An array of [line item objects](#line-items) that will be displayed in the form.
- `total: object`. A [line item object](#line-items) with the final total to be paid.
- `theme?: object`. A [theme object](#styles-and-themes).
- `onPaymentComplete: () => null`. A function to call for non-redirect payment methods when payment is successful.
- `showErrorMessage: (string) => null`. A function that will display a message with an "error" type.
- `showInfoMessage: (string) => null`. A function that will display a message with an "info" type.
- `showSuccessMessage: (string) => null`. A function that will display a message with a "success" type.
- `onEvent?: (action) => null`. A function called for all sorts of events in the code. The callback will be called with a [Flux Standard Action](https://github.com/redux-utilities/flux-standard-action).
- `successRedirectUrl: string`. The url to load if using a redirect payment method and it succeeds.
- `failureRedirectUrl: string`. The url to load if using a redirect payment method and it fails.
- `paymentMethods: object[]`: An array of [Payment Method objects](#payment-methods).
- `registry?: object`. An object returned by [createRegistry](#createRegistry). If not provided, a default registry will be created.
- `isLoading?: boolean`. If set and true, the form will be replaced with a loading placeholder.

The line items are for display purposes only. They should also include subtotals, discounts, and taxes. No math will be performed on the line items. Instead, the amount to be charged will be specified by the required prop `total`, which is another line item.

### CheckoutReviewOrder

Renders a list of the line items and their `displayValue` properties followed by the `total` line item, and whatever `submitButton` is in the current payment method.

### CheckoutStep

Each of the steps in the checkout flow will be rendered by one of these. Renders its `children` prop and includes a numbered stepper icon which corresponds to its `stepNumber` prop. Each step must also have a `title` prop for its header. There are two boolean props that can be used to control the step's current state: `isComplete` and `isActive`. Typically the step will be hidden when `isActive` is false and may have a different appearance when `isComplete` is true.

Each should include in its `children` a `CheckoutNextStepButton` if there is a following step.

If a step has the `onEdit` prop, it will include an "Edit" link which will call the `onEdit` prop function. The parent component is responsible for using this to toggle the component's state in an appropriate way. The parent should also modify the URL so that the state is serialized somehow in the URL (this allows the "Back" button to work in an expected way when collapsing and expanding steps).

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

### createPayPalMethod

Creates a [Payment Method](#payment-methods) object. Requires passing an object with the following properties:

- `registerStore: object => object`. The `registerStore` function from the return value of [createRegistry](#createRegistry).
- `submitTransaction: async object => string`. An async function that sends the request to the endpoint to get the redirect url.

### createStripeMethod

Creates a [Payment Method](#payment-methods) object. Requires passing an object with the following properties:

- `registerStore: object => object`. The `registerStore` function from the return value of [createRegistry](#createRegistry).
- `fetchStripeConfiguration: async ?object => object`. An async function that fetches the stripe configuration (we use Stripe for Apple Pay).
- `submitTransaction: async object => object`. An async function that sends the request to the endpoint.
- `getCountry: () => string`. A function that returns the country to use for the transaction.
- `getPostalCode: () => string`. A function that returns the postal code for the transaction.
- `getSubdivisionCode: () => string`. A function that returns the subdivision code for the transaction.
- `getPhoneNumber: () => string`. A function that returns the phone number for the transaction.

### getDefaultOrderReviewStep

Returns a [Step object](#steps) which displays an order review. Although it can be modified before passing it to [Checkout](#checkout), by default it has no way to modify the purchase (eg: you cannot delete items). Typically this is the last step of a form. Can be overridden completely to create a custom review step.

If not used as the last step, the two following properties should be customized if you want to provide translations:

- getEditButtonAriaLabel
- getNextStepButtonAriaLabel

### getDefaultOrderSummaryStep

Returns a [Step object](#steps) which displays an order summary. Although it can be modified before passing it to [Checkout](#checkout), by default it has no step number and cannot be made active. Typically used as the first step.

### getDefaultPaymentMethodStep

Returns a [Step object](#steps) which displays a form to choose a [Paymet Method](#payment-methods). It can be modified before passing it to [Checkout](#checkout). The payment methods displayed are those provided to the [CheckoutProvider](#checkoutprovider).

The two following properties should be customized if you want to provide translations:

- getEditButtonAriaLabel
- getNextStepButtonAriaLabel

### formatValueForCurrency

Takes two arguments, a currency string and an integer string and returns the locale-specific string displayValue. For example, the arguments (`USD`, `6000`) would return the string `$60.00`.

### renderDisplayValueMarkdown

Takes one argument, a displayValue string, and returns the displayValue with some minor Markdown formatting. Specifically, the `~~` characters can be used to make ~~strike-through~~ text.

### useActiveStep

A React Hook that will return the currently active [Step object](#steps). Only works within a step.

### useAllPaymentMethods

A React Hook that will return an array of all payment method objects. See `usePaymentMethod()`, which returns the active object only. Only works within [CheckoutProvider](#CheckoutProvider).

### useCheckoutRedirects

A React Hook that will return a two element array where the first element is the `successRedirectUrl` handler and the second is the `failureRedirectUrl` handler as passed to `Checkout`. Only works within [CheckoutProvider](#CheckoutProvider).

### useDispatch

A React Hook that will return all the bound action creators for a [Data store](#data-stores). Only works within [CheckoutProvider](#CheckoutProvider).

### useEvents

A React Hook that will return the `onEvent` callback as passed to `CheckoutProvider`. Only works within [CheckoutProvider](#CheckoutProvider).

### useFormStatus

A React Hook that will return an object with the following properties:

- `formStatus: string`. The current status of the form; one of 'loading', 'ready', 'submitting', or 'complete'.
- `setFormReady: () => void`. Function to change the form status to 'ready'.
- `setFormLoading: () => void`. Function to change the form status to 'loading'.
- `setFormSubmitting: () => void`. Function to change the form status to 'submitting'.
- `setFormComplete: () => void`. Function to change the form status to 'complete'. Note that this will trigger `onPaymentComplete` from [CheckoutProvider](#CheckoutProvider).

Only works within [CheckoutProvider](#CheckoutProvider).

### useIsStepActive

A React Hook that will return true if the current step is the currently active [Step](#steps). Only works within a step.

### useLineItems

A React Hook that will return a two element array where the first element is the current array of line items (matching the `items` prop on `Checkout`), and the second element is the current total (matching the `total` prop). Only works within [CheckoutProvider](#CheckoutProvider).

### useMessages

A React Hook that will return an object containing the `showErrorMessage`, `showInfoMessage`, and `showSuccessMessage` callbacks as passed to `CheckoutProvider`. Only works within [CheckoutProvider](#CheckoutProvider).

### usePaymentData

The [Checkout](#Checkout) component registers a [Data store](#data-stores) called 'checkout'. Rather than creating a custom store, any component can use this default store to keep arbitrary data with this React Hook. It returns a two element array, where the first element is the current payment data object (the state of the 'checkout' store) and the second argument is a function which will update the payment data object. The update function takes two arguments: a string which will be used as the property name for the modified data, and arbitrary data to be stored in that property.

For example,

```js
const [ paymentData, updatePaymentData ] = usePaymentData();
const onClick = () => updatePaymentData( 'color', 'green' );
// On next render, paymentData.color === 'green'
```

### usePaymentMethod

A React Hook that will return an object containing all the information about the currently selected payment method (or null if none is selected). The most relevant property is probably `id`, which is a string identifying whatever payment method was entered in the payment method step. Only works within [CheckoutProvider](#CheckoutProvider).

### usePaymentMethodId

A React Hook that will return a two element array. The first element is a string representing the currently selected payment method (or null if none is selected). The second element is a function that will replace the currently selected payment method. Only works within [CheckoutProvider](#CheckoutProvider).

### useRegisterStore

A React Hook that can be used to create a @wordpress/data store. This is the same as calling `registerStore()` but is easier to use within functional components because it will only create the store once. Only works within [CheckoutProvider](#CheckoutProvider).

### useRegistry

A React Hook that returns the @wordpress/data registry. Only works within [CheckoutProvider](#CheckoutProvider).

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

To maintain the integrity of the line item schema, adding custom fields is discouraged, but allowed. If you need specific custom data as part of a line item so that it can be used in another part of the form, it's recommended to pass the line item object through a helper function to collect the extra data rather than serializing it into the line item itself. This will make that data collection more testable. However, if the data collection process is expensive or slow, and caching isn't an option, it may make sense to preload the data into the line items.

## Development

In the root of the monorepo, run `npm run composite-checkout-demo` which will start a local webserver that will display the component.

To run the tests for this package, run `npm run test-packages composite-checkout`.
