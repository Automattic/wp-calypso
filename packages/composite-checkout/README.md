# Composite Checkout

A set of React components, custom Hooks, and helper functions that together can be used to create a purchase and checkout flow.

## Installation

`npm install composite-checkout styled-components`

## Description

This package provides a context provider, `CheckoutProvider`, and a default component, `Checkout`, which creates a checkout form.

The form has three steps:

1. Payment method
2. Billing contact
3. Review order

The steps can be customized using various props.

For more detailed customization, it's possible to build a custom form using the other components exported by this package.

### Select payment method

The payment method options displayed on the form are chosen automatically by the component based on the environment, locale, and possibly other factors, but they will include only methods listed in the optional `availablePaymentMethods` array. If the array is not set, no appropriate payment methods will be excluded.

![payment method step](https://raw.githubusercontent.com/Automattic/wp-calypso/add/wp-checkout-component/packages/composite-checkout/doc-assets/payment-method-step.png 'Payment Method Step')

Any previously stored payment methods (eg: saved credit cards) will be fetched automatically and displayed in the relevant payment method section of this step.

The content of the second and third step vary based on the payment method chosen in the first step. For example, the second step may only request a postal code if the payment method is 'apple-pay', but it may request the full address for the 'card' method.

### Billing contact

This step contains various form fields to collect billing contact information from the customer.

![billing details step](https://raw.githubusercontent.com/Automattic/wp-calypso/add/wp-checkout-component/packages/composite-checkout/doc-asset/billing-step.png 'Billing Details Step')

### Review order

The third step presents a simple list of line items and a total, followed by a purchase button.

![review order step](https://raw.githubusercontent.com/Automattic/wp-calypso/add/wp-checkout-component/packages/composite-checkout/doc-asset/review-step.png 'Review Order Step')

### Customization slots

Some content can be overridden using "customization slots" passed as props to the `Checkout` component. Each of these is a React element type (a component class or function) which will be rendered by `Checkout` in a particular place. The slot components can access all the custom hooks in the package and will also be passed props appropriate to that component; see each customization slot for details about what props are provided.

There are several other optional props aside from `ReviewContent` which allow customizing the contents of the form. `UpSell` is a section at the bottom of the form, `CheckoutHeader` is the header of the form, `OrderReviewTOS` is displayed just below the payment button, and `OrderReviewFeatures` may be displayed (depending on the available screen space) adjacent to the form.

![component slots](https://raw.githubusercontent.com/Automattic/wp-calypso/add/wp-checkout-component/packages/composite-checkout/doc-asset/checkout-slots.png 'Highlighted component slots')

Any component within `Checkout` can use the custom React Hook `useLineItems`, which returns a two element array where the first element is the current array of line items (matching the `items` prop on `Checkout`), the second element is the current total (matching the `total` prop).

### Submitting the form

When the payment button is pressed, the form data will be validated and submitted in a way appropriate to the payment method. If there is a problem with either validation or submission, or if the payment method's service returns an error, the `onFailure` prop on `Checkout` will be called with an object describing the error.

If the payment method succeeds, the `onSuccess` prop will be called instead. It's important not to provision anything based on this callback, as it could be called by a malicious user. Instead, provisioning should be handled separately server-to-server.

Some payment methods may require a redirect to an external site. If that occurs, the `failureRedirectUrl` and `successRedirectUrl` props on `Checkout` will be used instead of the `onFailure` and `onSuccess` callbacks. All four props are required.

## Examples

### Example 1

Here is a very simple example of using the `Checkout` component with default options. Its review section is very basic and line items cannot be removed or added.

```js
import React, { useState } from 'react';
import { Checkout } from '@automattic/composite-checkout';
import { formatValueForCurrency } from 'composite-checkout/wpcom';

const initialItems = [
	{
		label: 'WordPress.com Personal Plan',
		id: 'wpcom-personal',
		type: 'plan',
		amount: { currency: 'USD', value: 6000, displayValue: '$60' },
	},
	{
		label: 'Domain registration',
		subLabel: 'example.com',
		id: 'wpcom-domain',
		type: 'domain',
		amount: { currency: 'USD', value: 0, displayValue: '~~$17~~ 0' },
	},
];

// These are used only for non-redirect payment methods
const onSuccess = () => console.log( 'Payment succeeded!' );
const onFailure = error => console.error( 'There was a problem with your payment', error );

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

async function makePayPalExpressRequest() {
	return 'https://paypal.com';
}

const paypalMethod = createPayPalMethod( { makePayPalExpressRequest } );

// This is the parent component which would be included on a host page
export default function MyCheckout() {
	const { items, total } = useShoppingCart();

	return (
		<CheckoutProvider
			locale={ 'US' }
			items={ items }
			total={ total }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
			successRedirectUrl={ successRedirectUrl }
			failureRedirectUrl={ failureRedirectUrl }
			paymentMethods={ [ paypalMethod ] }
		>
			<Checkout />
		</CheckoutProvider>
	);
}

// This is a very simple shopping cart manager which can calculate totals
function useShoppingCart() {
	const [ items ] = useState( initialItems );

	// The total must be calculated outside checkout and need not be related to line items
	const lineItemTotal = items.reduce( ( sum, item ) => sum + item.amount.value, 0 );
	const currency = items.reduce( ( lastCurrency, item ) => item.amount.currency, 'USD' );
	const total = {
		label: 'Total',
		amount: {
			currency,
			value: lineItemTotal,
			displayValue: formatValueForCurrency( currency, lineItemTotal ),
		},
	};

	return { items, total };
}
```

### Example 2

The following bigger example demonstrates a checkout page using many of the options available. Notably this uses a custom review section and line items can be added, removed, and modified.

```js
import React, { useState } from 'react';
import {
	Checkout,
	useLineItems,
	OrderReviewLineItems,
	OrderReviewSection,
	OrderReviewTotal,
	renderDisplayValueMarkdown,
} from '@automattic/composite-checkout';
import {
	PlanLengthSelector,
	formatValueForCurrency,
	adjustItemPricesForCountry,
	replacePlanWithDifferentLength,
} from 'composite-checkout/wpcom';

const initialItems = [
	{
		label: 'WordPress.com Personal Plan',
		id: 'wpcom-personal',
		type: 'plan',
		amount: { currency: 'USD', value: 6000, displayValue: '$60' },
	},
	{
		label: 'Domain registration',
		subLabel: 'example.com',
		id: 'wpcom-domain',
		type: 'domain',
		amount: { currency: 'USD', value: 0, displayValue: '~~$17~~ 0' },
	},
];

// These will only be shown if appropriate and can be used to disable certain payment methods for testing or other purposes.
const availablePaymentMethods = [ 'apple-pay', 'card', 'paypal', 'ebanx', 'ideal' ];

// These are used only for non-redirect payment methods
const onSuccess = () => console.log( 'Payment succeeded!' );
const onFailure = error => console.error( 'There was a problem with your payment', error );

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

async function makePayPalExpressRequest() {
	return 'https://paypal.com';
}

const paypalMethod = createPayPalMethod( { makePayPalExpressRequest } );

// This is the parent component which would be included on a host page
export default function MyCheckout() {
	const {
		itemsWithTax,
		total,
		addItem,
		deleteItem,
		changePlanLength,
		updatePricesForAddress,
	} = useShoppingCart();

	// Some parts of the checkout can be customized
	const ReviewContent = () => (
		<OrderReview onDeleteItem={ deleteItem } onChangePlanLength={ changePlanLength } />
	);

	// Modification of the line items must be done outside checkout
	const quickStartItem = {
		label: 'Quick Start',
		id: 'quickstart',
		type: 'quickstart',
		amount: { currency: 'USD', value: 2500, displayValue: '~~$50~~ $25' },
	};
	const addQuickStart = () => addItem( quickStartItem );
	const UpSell = () => <UpSellCoupon onClick={ addQuickStart } />;

	return (
		<CheckoutProvider
			locale={ 'US' }
			items={ itemsWithTax }
			total={ total }
			onSuccess={ onSuccess }
			onFailure={ onFailure }
			successRedirectUrl={ successRedirectUrl }
			failureRedirectUrl={ failureRedirectUrl }
			paymentMethods={ [ paypalMethod ] }
		>
			<Checkout
				availablePaymentMethods={ availablePaymentMethods }
				ReviewContent={ ReviewContent }
				UpSell={ UpSell }
			/>
		</CheckoutProvider>
	);
}

// This is a simple shopping cart manager which allows CRUD operations
function useShoppingCart() {
	const [ items, setItems ] = useState( initialItems );

	// Tax calculation must be performed outside checkout
	const lineItemTotalWithoutTax = items.reduce( ( sum, item ) => sum + item.amount.value, 0 );
	const taxRate = 0.09;
	const taxValue = taxRate * lineItemTotalWithoutTax;
	const taxItem = {
		label: 'Taxes',
		id: 'tax',
		type: 'tax',
		amount: {
			currency: 'USD',
			value: taxValue,
			displayValue: formatValueForCurrency( currency, taxValue ),
		},
	};
	const itemsWithTax = [ ...items, taxItem ];

	// The checkout itself does not trigger any events apart from success/failure
	const deleteItem = itemToDelete =>
		setItems( items.filter( item => item.id !== itemToDelete.id ) );
	const changePlanLength = ( plan, planLength ) =>
		setItems( replacePlanWithDifferentLength( items, planLength ) );
	const updatePricesForAddress = address =>
		setItems( adjustItemPricesForCountry( items, address.country ) );
	const addItem = item => setItems( [ ...items, item ] );

	// The total must be calculated outside checkout and need not be related to line items
	const lineItemTotal = itemsWithTax.reduce( ( sum, item ) => sum + item.amount.value, 0 );
	const currency = items.reduce( ( lastCurrency, item ) => item.amount.currency, 'USD' );
	const total = {
		label: 'Total',
		amount: {
			currency,
			value: lineItemTotal,
			displayValue: formatValueForCurrency( currency, lineItemTotal ),
		},
	};

	return {
		items,
		itemsWithTax,
		total,
		addItem,
		deleteItem,
		changePlanLength,
		updatePricesForAddress,
	};
}

function OrderReview( { onDeleteItem, onChangePlanLength } ) {
	const [ items, total ] = useLineItems();
	const planItems = items.filter( item => item.type === 'plan' );
	const domainItems = items.filter( item => item.type === 'domain' );
	const taxItems = items.filter( item => item.type === 'tax' );
	const miscItems = items.filter( item => ! [ 'plan', 'domain', 'tax' ].includes( item.type ) );

	return (
		<React.Fragment>
			<OrderReviewSection>
				{ planItems.map( plan => (
					<PlanItem
						key={ plan.id }
						plan={ plan }
						onDeleteItem={ onDeleteItem }
						onChangePlanLength={ onChangePlanLength }
					/>
				) ) }
				<OrderReviewLineItems items={ miscItems } />
			</OrderReviewSection>
			<OrderReviewSection>
				{ domainItems.map( item => (
					<DomainItem key={ item.id } item={ item } onDeleteItem={ onDeleteItem } />
				) ) }
			</OrderReviewSection>
			<OrderReviewSection>
				<OrderReviewLineItems items={ taxItems } />
				<OrderReviewTotal total={ total } />
			</OrderReviewSection>
		</React.Fragment>
	);
}

function PlanItem( { plan, onDeleteItem, onChangePlanLength } ) {
	const changePlanLength = planLength => onChangePlanLength( plan, planLength );
	const deleteItem = () => onDeleteItem( plan );
	return (
		<React.Fragment>
			<div>
				<span>
					<div>{ plan.label }</div>
					{ plan.subLabel && <div>{ plan.subLabel }</div> }
				</span>
				<span>{ renderDisplayValueMarkdown( plan.amount.displayValue ) }</span>
				<button onClick={ deleteItem } />
			</div>
			<PlanLengthSelector onChange={ changePlanLength } />
		</React.Fragment>
	);
}

function DomainItem( { item, onDeleteItem } ) {
	const deleteItem = () => onDeleteItem( plan );
	return (
		<React.Fragment>
			<div>
				<span>
					<div>{ item.label }</div>
					{ item.subLabel && <div>{ item.subLabel }</div> }
				</span>
				<span>{ renderDisplayValueMarkdown( item.amount.displayValue ) }</span>
				<button onClick={ deleteItem } />
			</div>
		</React.Fragment>
	);
}

function UpSellCoupon( { onClick } ) {
	return (
		<div>
			<h4>Exclusive offer</h4>
			<p>Buy a quick start session and get 50% off.</p>
			<a href="#" onClick={ onClick }>
				Add to cart
			</a>
		</div>
	);
}
```

## Styles and Themes

Each component will be styled using [styled-components](https://www.styled-components.com/) (included in this package as a [peer dependency](https://nodejs.org/en/blog/npm/peer-dependencies/)) and many of the styles will be editable by passing a `theme` object to the `CheckoutProvider`.

For style customization beyond what is available in the theme, each component will also include a unique static className using BEM syntax.

When using the individual API components, you can also pass a `className` prop, which will be applied to that component in addition to the classNames from BEM and styled-components.

## Payment Methods

A payment method, in the context of this package, consists of the following pieces:

- A unique id.
- A data object that holds any data needed by the payment method, including data from any payment method components.
- A component that displays that payment method selection button which can be as simple as the name and an icon. It will receive the props of the `CheckoutStep`.
- A component that displays that payment method (this can be as simple as the name and an icon or as complex as a credit card form). It will receive the props of the `CheckoutStep`.
- A component form that displays the required billing contact information. It will receive the props of the `CheckoutStep`.
- A component button that is used to submit the payment method. This button should include a click handler that performs the actual payment process. The button can access the success and failure handlers by calling the `useCheckoutHandlers()` custom Hook or it can find the redirect urls by calling the `useCheckoutRedirects()` custom Hook.
- (Optional) A component that wraps the whole of the checkout form. This can be used for custom data providers (eg: `StripeProvider`).
- A component that renders a summary of the selected payment method when the step is inactive.
- A function to return the name of the Payment Method. It will receive the localize function as an argument.

Payment methods are modular, but are built into the package and should not be added or changed by the host page. They can be disabled by using the `availablePaymentMethods` prop on the `Checkout` component.

Each payment method has the following schema:

```
{
	id: string,
	LabelComponent: component,
	PaymentMethodComponent: component,
	BillingContactComponent: component,
	SubmitButtonComponent: component,
	CheckoutWrapper: ?component,
	SummaryComponent: component,
	getAriaLabel: function,
}
```

Within the components, the Hook `usePaymentMethod()` will return an object of the above form with the key of the currently selected payment method or null if none is selected. To retrieve all the payment methods and their properties, the function `getPaymentMethods()` will return an array that contains them all.

## Data Stores

Each Payment Method or component can create a Redux-like data store by using the `registerStore` function. Code can then access that data by using `dispatch`, `select`, and `subscribe`. These functions can be accessed by calling the `useRegistry` hook. Components can most easily use the data with the `useDispatch` and `useSelect` hooks. Read the [@wordpress/data](https://wordpress.org/gutenberg/handbook/packages/packages-data/) docs to learn more about the details of this system.

In addition to the features of that package, we provide a `useRegisterStore` hook which takes the same arguments as `registerStore` and will allow creating a new store just before a component first renders.

The registry used for these stores is created by default in `CheckoutProvider` but you can use a custom one by including the `registry` prop on that component.

## API

While the `Checkout` component takes care of most everything, there are many situations where its appearance and behavior will be customized. In these cases it's appropriate to use the underlying building blocks of this package.

### Checkout

The main component in this package. It has the following props.

- availablePaymentMethods: array
- ReviewContent: component
- UpSell: component
- CheckoutHeader: component
- OrderReviewTOS: component
- OrderReviewFeatures: component

### CheckoutNextStepButton

Renders a button to move to the next `CheckoutStep` component. Its `value` prop can be used to customize the text which by default will be "Continue".

### CheckoutPaymentMethods

Renders buttons for each payment method that can be used out of the array in the `availablePaymentMethods` prop. The `onChange` callback prop can be used to determine which payment method has been selected. When the `isComplete` prop is true and `isActive` is false, it will display a summary of the current choice.

### CheckoutProvider

Renders its `children` prop and acts as a React Context provider. All of checkout should be wrapped in this.

It has the following props.

- locale: string (required)
- items: array (required)
- total: object (required)
- theme: object (optional)
- onSuccess: function (required)
- onFailure: function (required)
- successRedirectUrl: string (required)
- failureRedirectUrl: string (required)
- paymentMethods: array (required)
- registry: object (optional)

The line items must be passed to `Checkout` using the required `items` array prop. Each item is an object of the form `{ label: string, subLabel: string, id: string, type: string, amount: { currency: string, value: int, displayValue: string } }`. All the properties are required except for `subLabel`, and `id` must be unique. The `type` property is not used internally but can be used to organize the line items.

If any event in a customization slot causes the line items to change (for example, deleting something during the review step), the `items` array should not be mutated. It is incumbent on the parent component to create a modified line item list and then update `Checkout`.

The line items are for display purposes only. They should also include subtotals, discounts, and taxes. No math will be performed on the line items. Instead, the amount to be charged will be specified by the required prop `total`, which is another line item.

The `displayValue` property of both the items and the total can use limited Markdown formatting, including the `~~` characters for strike-through text. If customizing this component, the property should be passed through the `renderDisplayValueMarkdown()` helper.

`paymentMethods` is an array of Payment Method objects.

`registry` is an object returned by `createRegistry`. If not provided, a default registry will be created.

### CheckoutReviewOrder

Renders a list of the line items and their `displayValue` properties followed by the `total` line item, and whatever `SubmitButtonComponent` is in the current payment method.

### CheckoutStep

Each of the three steps in the checkout flow will be rendered by one of these. Renders its `children` prop and includes a numbered stepper icon which corresponds to its `stepNumber` prop. Each step must also have a `title` prop for its header. There are two boolean props that can be used to control the step's current state: `isComplete` and `isActive`. Typically the step will be hidden when `isActive` is false and may have a different appearance when `isComplete` is true.

Each should include in its `children` a `CheckoutNextStepButton` if there is a following step.

If a step has the `onEdit` prop, it will include an "Edit" link when `isComplete` is true which will call the `onEdit` prop function. The parent component is responsible for using this to toggle the component's state in an appropriate way (perhaps by setting `isActive` to true). The parent should also modify the URL so that the state is serialized somehow in the URL (this allows the "Back" button to work in an expected way when collapsing and expanding steps).

### getPaymentMethods()

A helper function that will return an array of all payment method objects. See `usePaymentMethod()`, which returns the active object only.

### OrderReviewLineItems

Renders a list of line items passed in the `items` prop. Each line item must have at least the props `label`, `id`, and `amount.displayValue`.

An optional boolean prop, `collapsed`, can be used to simplify the output for when the review section is collapsed.

This component provides just a simple list of label and price. If you want to modify how each line item is displayed, or if you want to provide any actions for that item (eg: the ability to delete the item from the order), you cannot use this component; instead you should create a custom component.

### OrderReviewSection

A wrapper for a section of a list of related line items. Renders its `children` prop.

### OrderReviewTotal

Renders the `total` prop like a line item, but with different styling.

An optional boolean prop, `collapsed`, can be used to simplify the output for when the review section is collapsed.

### formatValueForCurrency(currency, int)

Takes two arguments, a currency string and an integer string and returns the locale-specific string displayValue. For example, the arguments (`USD`, `6000`) would return the string `$60.00`.

### renderDisplayValueMarkdown(displayValue)

Takes one argument, a displayValue string, and returns the displayValue with some minor Markdown formatting. Specifically, the `~~` characters can be used to make ~~strike-through~~ text.

### useCheckoutHandlers()

A React Hook that will return a two element array where the first element is the `onSuccess` handler and the second is the `onFailure` handler as passed to `Checkout`.

### useLineItems()

A React Hook that will return a two element array where the first element is the current array of line items (matching the `items` prop on `Checkout`), and the second element is the current total (matching the `total` prop).

### useCheckoutRedirects()

A React Hook that will return a two element array where the first element is the `successRedirectUrl` handler and the second is the `failureRedirectUrl` handler as passed to `Checkout`.

### useHasDomainsInCart()

A React Hook that will return whether there is a domain in the cart.

### usePaymentMethod()

A React Hook that will return an object containing all the information about the currently selected payment method (or null if none is selected). The most relevant property is probably `id`, which is a string identifying whatever payment method was entered in the payment method step.

### usePaymentMethodId()

A React Hook that will return a two element array. The first element is a string representing the currently selected payment method (or null if none is selected). The second element is a function that will replace the currently selected payment method.

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
