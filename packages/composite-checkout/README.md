# Composite Checkout

A set of React components, custom Hooks, and helper functions that together can be used to create a purchase and checkout flow.

## Installation

You can install this package using yarn with:

`yarn add @automattic/composite-checkout`

Or with npm:

`npm install @automattic/composite-checkout`

## Description

This package has four pieces that can be used together or separately:

- [A data provider.](#the-data-provider)
- [A multi-step form.](#the-multi-step-form)
- [A list of payment method options.](#the-list-of-payment-method-options)
- [A transaction system.](#the-transaction-system)

The primary use is to combine all these pieces to create a checkout flow with a payment method selection step that can submit a transaction and handle the result, but it is possible to heavily customize this behavior or to use these pieces in other ways.

### The data provider

All this package's React components require being inside of a [CheckoutProvider](#CheckoutProvider).

It has many optional props, but the main ones you need to know are `paymentMethods` and `paymentProcessors`.

`paymentMethods` is an array of [payment method objects](#payment-methods). These are a special type of object containing a UI label element for that payment method, an optional form for data that payment method may need, and a submit button for that payment method. The payment method object is purely UI and state; the actual submission of its data will be handled by the payment processor function.

`paymentProcessors` is an object map of payment processor functions keyed by their id. The key is defined by payment method objects that wish to use the processor. The object's value is an async function which will be called when the submit button in a payment method object is pressed. This function will return a special value to notify the transaction system about the status of the transaction.

### The multi-step form

A [CheckoutStepGroup](#CheckoutStepGroup) can be used to wrap [CheckoutStep](#CheckoutStep) components, creating a form with multiple steps. Each step contains a UI element and an async function that decides if the step is complete.

When the final step is complete, the active payment method's submit button (rendered by [CheckoutFormSubmit](#CheckoutFormSubmit)) will be enabled.

The steps can contain any sort of data, but one of the steps should typically be a list of payment method options.

### The list of payment method options

The [PaymentMethodStep](#PaymentMethodStep) is a pre-built [CheckoutStep](#CheckoutStep) which lists all the available payment methods passed to the [CheckoutProvider](#CheckoutProvider) as radio buttons (unless they have been disabled by [useTogglePaymentMethod](#useTogglePaymentMethod)).

### The transaction system

While the transaction is processing, the entire form will be marked as disabled and will have a busy indicator.

When a payment processor function tells the transaction system that the transaction is complete, has an error, or has a redirect, an appropriate callback will be called on the [CheckoutProvider](#CheckoutProvider): `onPaymentComplete`, `onPaymentError`, or `onPaymentRedirect`, respectively.

## Example

See the [demo](demo/index.js) for an example of using this package.

## Styles and Themes

Each component will be styled using [@emotion/styled](https://emotion.sh/docs/styled) and many of the styles will be editable by passing a `theme` object to the [CheckoutProvider](#CheckoutProvider). The [checkoutTheme](#checkoutTheme) object is available from the package API, and can be merged with new values to customize the design.

## Payment Methods

Each payment method is an object with the following properties:

- `id: string`. A unique id for this instance of this payment method.
- `paymentProcessorId: string`. The id that will be used to map this payment method to a payment processor function. Unlike the `id`, this does not have to be unique.
- `label?: React.ReactNode`. A component that displays that payment method selection button which can be as simple as the name and an icon.
- `hasRequiredFields?: boolean`. If the payment method `activeContent` contains fields or other required interactions, this must be true!
- `activeContent?: React.ReactNode`. A component that displays that payment method (this can return null or something like a credit card form).
- `inactiveContent?: React.ReactNode`. A component that renders a summary of the selected payment method when the step is inactive.
- `submitButton: React.ReactNode`. A component button that is used to submit the payment method. This button should include a click handler that performs the actual payment process. When disabled, it will be provided with the `disabled` prop and must disable the button.
- `getAriaLabel: (localize: (value: string) => string) => string`. A function to return the name of the Payment Method. It will receive the localize function as an argument.

Within the components inside [CheckoutProvider](#CheckoutProvider), [usePaymentMethod](#usePaymentMethod) will return the currently selected payment method object if one is selected.

When a payment method is ready to submit its data, it can use an appropriate "payment processor" function. These are functions passed to [CheckoutProvider](#CheckoutProvider) with the `paymentProcessors` prop and each one has a unique key. For convenience, the `submitButton` will be provided with an `onClick` function prop that will begin the transaction. The `onClick` function takes one argument, an object that contains the data needed by the payment processor function.

The payment processor function's response will control what happens next. Each payment processor function must return a Promise that resolves to one of three results: [makeRedirectResponse](#makeRedirectResponse), [makeSuccessResponse](#makeSuccessResponse), or [makeErrorResponse](#makeErrorResponse).

## API

### Button

A generic button component that is used internally for almost all buttons (like the "Continue" button on each step). You can use it if you want a button with a similar appearance. It has the following explicit props, and any additional props will be passed on directly to the HTML `button` (eg: `onClick`).

- `buttonType?: 'paypal'|'primary'|'secondary'|'text-button'|'borderless'`. An optional special button style.
- `fullWidth?: bool`. The button width defaults to 'auto', but if this is set it will be '100%'.
- `isBusy?: bool`. If true, the button will be displayed as a loading spinner.

### CheckoutFormSubmit

An element that will display a checkout submit button when placed inside a [CheckoutStepGroup](#CheckoutStepGroup).

- `submitButtonHeader: React.ReactNode`. Displays with the Checkout submit button.
- `submitButtonFooter: React.ReactNode`. Displays with the Checkout submit button.
- `disableSubmitButton: boolean`. If true, the submit button will always be disabled. If false (the default), the submit button will be enabled only on the last step and only if the [formStatus](#useFormStatus) is [`.READY`](#FormStatus).
- `validateForm?`: `() => Promise< boolean >`. A callback that will be called when the `onClick` event is triggered. If the callback is passed and its Promise resolves to a falsy value, the `onClick` handler will **not** be triggered. **No notification will be given to the user if this happens.**
- `submitButton?`: `React.ReactNode`. If set, this will override the normal submit button with whatever you would like.

### CheckoutErrorBoundary

A [React error boundary](https://reactjs.org/docs/error-boundaries.html) that can be used to wrap any components you like. There are several layers of these already built-in to `CheckoutProvider` and its children, but you may use this to manually wrap components. It has the following props.

- `errorMessage: React.ReactNode`. The error message to display to the user if there is a problem; typically a string but can also be a component.
- `onError?: (error: Error) => void`. A function to be called when there is an error. Can be used for logging.

### CheckoutProvider

Renders its `children` prop and acts as a React Context provider. All of checkout should be wrapped in this.

It has the following props.

- `theme?: object`. A [theme object](#styles-and-themes).
- `onPaymentComplete?: ({paymentMethodId: string | null, transactionLastResponse: unknown }) => null`. A function to call for non-redirect payment methods when payment is successful. Passed the current payment method id and the transaction response as set by the payment processor function.
- `onPaymentRedirect?: ({paymentMethodId: string | null, transactionLastResponse: unknown }) => null`. A function to call for redirect payment methods when payment begins to redirect. Passed the current payment method id and the transaction response as set by the payment processor function.
- `onPaymentError?: ({paymentMethodId: string | null, transactionError: string | null }) => null`. A function to call for payment methods when payment is not successful.
- `onPageLoadError?: ( errorType: string, error: Error, errorData?: Record< string, string | number | undefined > ) => void`. A function to call when an internal error boundary triggered.
- `onPaymentMethodChanged?: (method: string) => void`. A function to call when the active payment method is changed. The argument will be the method's id.
- `paymentMethods: object[]`. An array of [Payment Method objects](#payment-methods). Can be disabled by [useTogglePaymentMethod](#useTogglePaymentMethod).
- `paymentProcessors: object`. A key-value map of payment processor functions (see [Payment Methods](#payment-methods)).
- `isLoading?: boolean`. If set and true, the form will be replaced with a [loading placeholder](#LoadingContent) and the form status will be set to [`.LOADING`](#FormStatus) (see [useFormStatus](#useFormStatus)).
- `isValidating?: boolean`. If set and true, the form status will be set to [`.VALIDATING`](#FormStatus) (see [useFormStatus](#useFormStatus)).
- `redirectToUrl?: (url: string) => void`. Will be used by [useTransactionStatus](#useTransactionStatus) if it needs to redirect. If not set, it will change `window.location.href`.
- `initiallySelectedPaymentMethodId?: string | null`. If set, is used to preselect a payment method on first load or when the `paymentMethods` array changes. Default is `null`, which yields no initial selection. To change the selection in code, see the [`usePaymentMethodId`](#usePaymentMethodId) hook. If a disabled payment method is chosen, it will appear that no payment method is selected.
- `selectFirstAvailablePaymentMethod?: boolean`. If set and `initiallySelectedPaymentMethodId` is _not_ set, this is used to preselect a payment method on first load or when the `paymentMethods` array changes.

In addition, `CheckoutProvider` monitors the [transaction status](#useTransactionStatus) and will take actions when it changes.

- If the `transactionStatus` changes to [`.PENDING`](#TransactionStatus), the [form status](#useFormStatus) will be set to [`.SUBMITTING`](#FormStatus).
- If the `transactionStatus` changes to [`.ERROR`](#TransactionStatus), the transaction status will be set to [`.NOT_STARTED`](#TransactionStatus), the [form status](#useFormStatus) will be set to [`.READY`](#FormStatus), and the error message will be sent to the `onPaymentError` handler.
- If the `transactionStatus` changes to [`.COMPLETE`](#TransactionStatus), the `onPaymentComplete` function will be called.
- If the `transactionStatus` changes to [`.REDIRECTING`](#TransactionStatus), the page will be redirected to the `transactionRedirectUrl` (or will register an error as above if there is no url).
- If the `transactionStatus` changes to [`.NOT_STARTED`](#TransactionStatus), the [form status](#useFormStatus) will be set to [`.READY`](#FormStatus).

### CheckoutStep

A checkout step. This should be a direct child of [CheckoutStepGroup](#CheckoutStepGroup) and is itself a wrapper for [CheckoutStepBody](#CheckoutStepBody). If you want to make something that looks like a step but is not connected to other steps, use a [CheckoutStepBody](#CheckoutStepBody) instead.

This component's props are:

- `stepId: string`. A unique ID for the step.
- `className?: string`. A className for the step wrapper.
- `titleContent: React.ReactNode`. Displays as the title of the step.
- `activeStepContent?: React.ReactNode`. Displays as the content of the step when it is active. It is also displayed when the step is inactive but is hidden by CSS.
- `completeStepContent?: React.ReactNode`. Displays as the content of the step when it is inactive and complete as defined by the `isCompleteCallback`.
- `isCompleteCallback: () => boolean | Promise<boolean>`. Used to determine if a step is complete for purposes of validation. Note that this is not called for the last step!
- `editButtonAriaLabel?: string`. Used to fill in the `aria-label` attribute for the "Edit" button if one exists.
- `nextStepButtonAriaLabel?: string`. Used to fill in the `aria-label` attribute for the "Continue" button if one exists.
- `canEditStep?: boolean`. If false, the step will never show an "Edit" button. Defaults to true.
- `editButtonText?: string`. Used in place of "Edit" on the edit step button.
- `nextStepButtonText?: string`. Used in place of "Continue" on the next step button.
- `validatingButtonText?: string`. Used in place of "Please wait…" on the next step button when `isCompleteCallback` returns an unresolved Promise.
- `validatingButtonAriaLabel:? string`. Used for the `aria-label` attribute on the next step button when `isCompleteCallback` returns an unresolved Promise.

### CheckoutStepBody

A component that looks like a checkout step. Normally you don't need to use this directly, since [CheckoutStep](#CheckoutStep) creates this for you, but you can use it manually if you wish.

This component's props are:

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

### CheckoutStepGroup

A container for [CheckoutStep](#CheckoutStep) elements.

Available props:

- `areStepsActive?: boolean`. A boolean you can set to explicitly disable all the steps in the group.
- `stepAreaHeader?: ReactNode`. A slot for additional components that can be injected at the top of the step group.
- `loadingContent?: ReactNode`. A component that will be displayed while checkout is loading. The default is [LoadingContent](#LoadingContent).
- `loadingHeader?: ReactNode`. A component that will be displayed above the main content while checkout is loading.
- `onStepChanged?: ({ stepNumber: number | null; previousStepNumber: number; paymentMethodId: string }) => void`. A function to call when the active checkout step is changed.
- `store?: CheckoutStepGroupStore`. A way to inject a data store for the step group created by [createCheckoutStepGroupStore](#createCheckoutStepGroupStore). If not provided, a store will be created automatically.

### FormStatus

An enum that holds the values of the [form status](#useFormStatus).

- `.LOADING`
- `.READY`
- `.SUBMITTING`
- `.VALIDATING`

### PaymentMethodStep

A pre-built [CheckoutStep](#CheckoutStep) to select the payment method. It does not require any props but any of the [CheckoutStep](#CheckoutStep) props can be overridden by passing them to this component.

### PaymentProcessorResponseType

An enum that holds the values of the [payment processor function return value's `type` property](#payment-methods) (each payment processor function returns a Promise that resolves to `{type: PaymentProcessorResponseType, payload: string | unknown }` where the payload varies based on the response type).

- `.SUCCESS` (the payload will be an `unknown` object that is the server response).
- `.REDIRECT` (the payload will be a `string` that is the redirect URL).
- `.ERROR` (the payload will be a `string` that is the error message).

### TransactionStatus

An enum that holds the values of the [transaction status](#useTransactionStatus).

- `.NOT_STARTED`
- `.PENDING`
- `.COMPLETE`
- `.REDIRECTING`
- `.ERROR`

### checkoutTheme

An [@emotion/styled](https://emotion.sh/docs/styled) theme object that can be merged with custom theme variables and passed to [CheckoutProvider](#checkout-provider) in order to customize the default Checkout design.

## createCheckoutStepGroupStore

A function to create a `CheckoutStepGroupStore` which can be passed to [CheckoutStepGroup](#CheckoutStepGroup) if you need additional control over the steps.

### makeErrorResponse

An action creator function to be used by a [payment processor function](#payment-methods) for a [ERROR](#PaymentProcessorResponseType) response. It takes one string argument and will record the string as the error.

### makeRedirectResponse

An action creator function to be used by a [payment processor function](#payment-methods) for a [REDIRECT](#PaymentProcessorResponseType) response. It takes one string argument and will cause the page to redirect to the URL in that string.

### makeSuccessResponse

An action creator function to be used by a [payment processor function](#payment-methods) for a [SUCCESS](#PaymentProcessorResponseType) response. It takes one object argument which is the transaction response. It will cause checkout to mark the payment as complete and run the `onPaymentComplete` function on the [CheckoutProvider](#CheckoutProvider).

### useAllPaymentMethods

A React Hook that will return an array of all payment method objects. See `usePaymentMethod()`, which returns the active object only. Only works within [CheckoutProvider](#CheckoutProvider).

### useFormStatus

A React Hook that will return an object with the following properties. Used to represent and change the current status of the checkout form (eg: causing it to be disabled). This differs from the status of the transaction itself, which is handled by [useTransactionStatus](#useTransactionStatus).

- `formStatus: `[`FormStatus`](#FormStatus). The current status of the form.
- `setFormReady: () => void`. Function to change the form status to [`.READY`](#FormStatus).
- `setFormLoading: () => void`. Function to change the form status to [`.LOADING`](#FormStatus).
- `setFormValidating: () => void`. Function to change the form status to [`.VALIDATING`](#FormStatus).
- `setFormSubmitting: () => void`. Function to change the form status to [`.SUBMITTING`](#FormStatus). Usually you can use [setTransactionPending](#useTransactionStatus) instead, which will call this.

Only works within [CheckoutProvider](#CheckoutProvider) which may sometimes change the status itself based on its props.

### useIsStepActive

A React Hook that will return true if the current step is the currently active step. Only works within a step.

### useIsStepComplete

A React Hook that will return true if the current step is complete as defined by the `isCompleteCallback` of that step. Only works within a step.

### usePaymentMethod

A React Hook that will return an object containing all the information about the currently selected payment method (or null if none is selected). The most relevant property is probably `id`, which is a string identifying whatever payment method was entered in the payment method step. Only works within [CheckoutProvider](#CheckoutProvider).

### usePaymentMethodId

A React Hook that will return a two element array. The first element is a string representing the currently selected payment method (or null if none is selected). The second element is a function that will replace the currently selected payment method. Only works within [CheckoutProvider](#CheckoutProvider).

### usePaymentProcessor

A React Hook that returns a payment processor function as passed to the `paymentProcessors` prop of [CheckoutProvider](#CheckoutProvider). Takes one argument which is the key of the processor function to return. Throws an Error if the key does not match a processor function. See [Payment Methods](#payment-methods) for an explanation of how this is used. Only works within [CheckoutProvider](#CheckoutProvider).

### usePaymentProcessors

A React Hook that returns all the payment processor functions in a Record.

### useProcessPayment

A React Hook that will return the `onClick` function passed to each [payment method's submitButton component](#payment-methods). The hook requires a payment processor ID. Call the returned function with data for the payment processor and it will begin the transaction.

### useMakeStepActive

A React Hook that will return a function to set a step to be the active step. Only works within a step. The returned function looks like `( stepId: string ) => Promise< boolean >;`. Calling this function is similar to pressing the "Edit" button on the specified step. This will attempt to complete each step between the active step and the new step, if jumping forward, stopping on any step that is not complete.

### useSetStepComplete

A React Hook that will return a function to set a step to "complete". Only works within a step but it does not have to be the targeted step. The returned function looks like `( stepId: string ) => Promise< boolean >;`. Calling this function is similar to pressing the "Continue" button on the specified step; it will call the `isCompleteCallback` prop of the step and only succeed if the callback succeeds. In addition, all previous incomplete steps will be marked as complete in the same way, and the process will fail and stop at the first step whose `isCompleteCallback` fails. The resolved Promise will return true if all the requested steps were completed and false if any of them failed.

### useTogglePaymentMethod

A React Hook that returns a function which can be called to enable or disable a payment method from the list of payment methods provided to [CheckoutProvider](#CheckoutProvider). Only works within `CheckoutProvider`.

The signature of the function returned by this hook is: `( paymentMethodId: string, available: boolean ) => void`.

### useTransactionStatus

A React Hook that returns an object with the following properties to be used by [payment methods](#payment-methods) for storing and communicating the current status of the transaction. This differs from the current status of the _form_, which is handled by [useFormStatus](#useFormStatus). Note, however, that [CheckoutProvider](#CheckoutProvider) will automatically perform certain actions when the transaction status changes. See [CheckoutProvider](#CheckoutProvider) for the details.

- `transactionStatus: `[`TransactionStatus`](#TransactionStatus). The current status of the transaction.
- `previousTransactionStatus: `[`TransactionStatus.`](#TransactionStatus). The last status of the transaction.
- `transactionError: string | null`. The most recent error message encountered by the transaction if its status is [`.ERROR`](#TransactionStatus).
- `transactionRedirectUrl: string | null`. The redirect url to use if the transaction status is [`.REDIRECTING`](#TransactionStatus).
- `transactionLastResponse: unknown | null`. The most recent full response object as returned by the transaction's endpoint and passed to `setTransactionComplete`.
- `resetTransaction: () => void`. Function to change the transaction status to [`.NOT_STARTED`](#TransactionStatus).
- `setTransactionComplete: ( transactionResponse: unknown ) => void`. Function to change the transaction status to [`.COMPLETE`](#TransactionStatus) and save the response object in `transactionLastResponse`.
- `setTransactionError: ( string ) => void`. Function to change the transaction status to [`.ERROR`](#TransactionStatus) and save the error in `transactionError`.
- `setTransactionPending: () => void`. Function to change the transaction status to [`.PENDING`](#TransactionStatus).
- `setTransactionRedirecting: ( string ) => void`. Function to change the transaction status to [`.REDIRECTING`](#TransactionStatus) and save the redirect URL in `transactionRedirectUrl`.

## Development

In the root of the monorepo, run `yarn workspace @automattic/composite-checkout run storybook:start` which will start a local webserver that will display the component.

To run the tests for this package, run `yarn run test-packages composite-checkout`.

**Please don't add anything to this package that is specific to WordPress.com checkout! It is a general purpose toolkit.**
