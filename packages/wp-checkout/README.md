# WP Checkout

A set of React components, custom Hooks, and helper functions that together can be used to create a purchase and checkout flow.

## 💰 Installation

`npm install wp-checkout styled-components`

## 💰 Usage

This package provides a primary component, `Checkout`, which creates a checkout form.

The form has three steps:

1. Payment method
2. Billing details
3. Review order

The steps can be customized using various props. `Checkout` is actually just a wrapper for other components and functions exported by this package, though, so if these customizations aren't sufficient, it's possible to build a custom form.

### Select payment method

The payment methods displayed in the first step are chosen from an optional array called `availablePaymentMethods`, which in turn is selected from the following options:

- 'web-payment'
- 'apple-pay'
- 'card'
- 'paypal'
- 'ebanx'
- 'ideal'

The actual payment method options displayed on the form are chosen automatically by the component based on the environment, locale, and possibly other factors, but they will include only methods in the `availablePaymentMethods` array.

Any previously stored payment methods (eg: saved credit cards) will be fetched automatically and displayed in the relevant payment method section of this step.

The content of the second and third step vary based on the payment method chosen in the first step. For example, the second step may only request a postal code if the payment method is 'apple-pay', but it may request the full address for the 'card' method.

Inside the component, this is a `CheckoutStep` wrapping a `CheckoutPaymentMethods` component.

### Billing details

This step contains various form fields to collect billing contact information from the customer.

The billing information may be automatically filled based on data retrieved from the server. If the billing address is set or changed during this step, the updated address will be used for the checkout. However, as a side effect, the optional `onChangeBillingContact` prop will be called with the updated address object so that the parent component can take any necessary actions like updating the line items and total.

Any other component can request the information from these form fields by using the `useBillingContact` React Hook.

Inside the component, this is a `CheckoutStep` wrapping a `CheckoutBillingContactForm` component.

### Review order

The third step presents a simple list of line items and a total, followed by a purchase button.

This step's content can be overridden using the `reviewContent` and `reviewContentCollapsed` props, which can be built from a set of building blocks provided by this package. See the example below for how to create a custom review area.

The line items must be passed to `Checkout` using the required `items` array prop. Each item is an object of the form `{ label: string, subLabel: string, id: string, type: string, amount: { currency: string, value: int, displayValue: string } }`. All the properties are required except for `subLabel`, and `id` must be unique. The `type` property is not used internally but can be used to organize the line items.

If any event in the form causes the line items to change (for example, deleting something during the review step), the `items` should not be mutated. It is incumbent on the parent component to create a modified line item list and then update `Checkout`.

The line items are for display purposes only. They should also include subtotals, discounts, and taxes. No math will be performed on the line items. Instead, the amount to be charged will be specified by the required prop `total`, which is another line item.

The `displayValue` property of both the items and the total can use limited Markdown formatting, including the `~~` characters for strike-through text. If customizing this component, the property should be passed through the `renderDisplayValueMarkdown()` helper.

There are several other optional props which allow customizing the contents of the form. `checkoutHeader` is the header of the form, `orderReviewTOS` is displayed just below the payment button, and `orderReviewFeatures` may be displayed (depending on the available screen space) adjacent to the form.

Any component within `Checkout` can use the custom React Hook `useCheckoutLineItems`, which returns a two element array where the first element is the current array of line items (matching the `items` prop on `Checkout`), the second element is the current total (matching the `total` prop).

### Submitting the form

When the payment button is pressed, the form data will be validated and submitted in a way appropriate to the payment method. If there is a problem with either validation or submission, or if the payment method's service returns an error, the `onFailure` prop on `Checkout` will be called with an object describing the error.

If the payment method succeeds, the `onSuccess` prop will be called instead. It's important not to provision anything based on this callback, as it could be called by a malicious user. Instead, provisioning should be handled separately server-to-server.

Some payment methods may require a redirect to an external site. If that occurs, the `failureRedirectUrl` and `successRedirectUrl` props on `Checkout` will be used instead of the `onFailure` and `onSuccess` callbacks. All four props are required.

## 💰 Example

### Example 1

Here is a very simple example of using the `Checkout` component with default options. Its review section is very basic and line items cannot be removed or added.

```js
import React, { useState } from 'react';
import Checkout from 'wp-checkout';
import { formatValueForCurrency } from 'wp-checkout/wpcom';

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
const onSuccess = () => console.log('Payment succeeded!');
const onFailure = error => console.error('There was a problem with your payment', error);

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

// This is the parent component which would be included on a host page
export default function MyCheckout() {
	const { items, total } = useShoppingCart();

	return (
		<Checkout
			locale={'US'}
			items={items}
			total={total}
			onSuccess={onSuccess}
			onFailure={onFailure}
			successRedirectUrl={successRedirectUrl}
			failureRedirectUrl={failureRedirectUrl}
		/>
	);
}

// This is a very simple shopping cart manager which can calculate totals
function useShoppingCart() {
	const [items] = useState(initialItems);

	// The total must be calculated outside checkout and need not be related to line items
	const lineItemTotal = items.reduce((sum, item) => sum + item.amount.value, 0);
	const currency = items.reduce((lastCurrency, item) => item.amount.currency, 'USD');
	const total = {
		label: 'Total',
		amount: {
			currency,
			value: lineItemTotal,
			displayValue: formatValueForCurrency(currency, lineItemTotal),
		},
	};

	return { items, total };
}
```

### Example 2

The following bigger example demonstrates a checkout page using many of the options available. Notably this uses a custom review section and line items can be added, removed, and modified.

```js
import React, { useState } from 'react';
import Checkout, {
	useCheckoutLineItems,
	OrderReviewLineItems,
	OrderReviewSection,
	OrderReviewTotal,
	OrderReviewLineItemDelete,
	renderDisplayValueMarkdown,
} from 'wp-checkout';
import {
	PlanLengthSelector,
	formatValueForCurrency,
	adjustItemPricesForCountry,
	replacePlanWithDifferentLength,
} from 'wp-checkout/wpcom';

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
const availablePaymentMethods = ['apple-pay', 'card', 'paypal', 'ebanx', 'ideal'];

// These are used only for non-redirect payment methods
const onSuccess = () => console.log('Payment succeeded!');
const onFailure = error => console.error('There was a problem with your payment', error);

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

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
	const reviewContent = (
		<OrderReview onDeleteItem={deleteItem} onChangePlanLength={changePlanLength} />
	);
	const reviewContentCollapsed = (
		<OrderReviewCollapsed />
	);

	// Modification of the line items must be done outside checkout
	const quickStartItem = {
		label: 'Quick Start',
		id: 'quickstart',
		type: 'quickstart',
		amount: { currency: 'USD', value: 2500, displayValue: '~~$50~~ $25' },
	};
	const addQuickStart = () => addItem(quickStartItem);
	const upSell = <UpSellCoupon onClick={addQuickStart} />;

	return (
		<Checkout
			locale={'US'}
			items={itemsWithTax}
			total={total}
			onChangeBillingContact={updatePricesForAddress}
			availablePaymentMethods={availablePaymentMethods}
			onSuccess={onSuccess}
			onFailure={onFailure}
			successRedirectUrl={successRedirectUrl}
			failureRedirectUrl={failureRedirectUrl}
			reviewContent={reviewContent}
			reviewContentCollapsed={reviewContentCollapsed}
			upSell={upSell}
		/>
	);
}

// This is a simple shopping cart manager which allows CRUD operations
function useShoppingCart() {
	const [items, setItems] = useState(initialItems);

	// Tax calculation must be performed outside checkout
	const lineItemTotalWithoutTax = items.reduce((sum, item) => sum + item.amount.value, 0);
	const taxRate = 0.09;
	const taxValue = taxRate * lineItemTotalWithoutTax;
	const taxItem = {
		label: 'Taxes',
		id: 'tax',
		type: 'tax',
		amount: {
			currency: 'USD',
			value: taxValue,
			displayValue: formatValueForCurrency(currency, taxValue),
		},
	};
	const itemsWithTax = [...items, taxItem];

	// The checkout itself does not trigger any events apart from success/failure
	const deleteItem = itemToDelete => setItems(items.filter(item => item.id === itemToDelete.id));
	const changePlanLength = (plan, planLength) =>
		setItems(replacePlanWithDifferentLength(items, planLength));
	const updatePricesForAddress = address =>
		setItems(adjustItemPricesForCountry(items, address.country));
	const addItem = item => setItems([...items, item]);

	// The total must be calculated outside checkout and need not be related to line items
	const lineItemTotal = itemsWithTax.reduce((sum, item) => sum + item.amount.value, 0);
	const currency = items.reduce((lastCurrency, item) => item.amount.currency, 'USD');
	const total = {
		label: 'Total',
		amount: {
			currency,
			value: lineItemTotal,
			displayValue: formatValueForCurrency(currency, lineItemTotal),
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

function OrderReview({ onDeleteItem, onChangePlanLength }) {
	const [items, total] = useCheckoutLineItems();
	const planItems = items.filter(item => item.type === 'plan');
	const domainItems = items.filter(item => item.type === 'domain');
	const taxItems = items.filter(item => item.type === 'tax');
	const miscItems = items.filter(item => ! ['plan', 'domain', 'tax'].includes(item.type));

	return (
		<React.Fragment>
			<OrderReviewSection>
				{planItems.map(plan => (
					<PlanItem
						key={plan.id}
						plan={plan}
						onDeleteItem={onDeleteItem}
						onChangePlanLength={onChangePlanLength}
					/>
				))}
				<OrderReviewLineItems items={miscItems} />
			</OrderReviewSection>
			<OrderReviewSection>
				{domainItems.map(item => (
					<DomainItem
						key={item.id}
						item={item}
						onDeleteItem={onDeleteItem}
					/>
				))}
			</OrderReviewSection>
			<OrderReviewSection>
				<OrderReviewLineItems items={taxItems} />
				<OrderReviewTotal total={total} />
			</OrderReviewSection>
		</React.Fragment>
	);
}

function OrderReviewCollapsed() {
	const [items, total] = useCheckoutLineItems();
	const planItems = items.filter(item => item.type === 'plan');
	const domainItems = items.filter(item => item.type === 'domain');
	const miscItems = items.filter(item => ! ['plan', 'domain', 'tax'].includes(item.type));

	return (
		<React.Fragment>
			<OrderReviewLineItems collapsed items={planItems} />
			<OrderReviewLineItems collapsed items={miscItems} />
			<OrderReviewLineItems collapsed items={domainItems} />
			<OrderReviewTotal collapsed total={total} />
		</React.Fragment>
	);
}

function PlanItem({ plan, onDeleteItem, onChangePlanLength }) {
	const changePlanLength = planLength => onChangePlanLength(plan, planLength);
	return (
		<React.Fragment>
			<div>
				<span>
					<div>{plan.label}</div>
					{plan.subLabel && <div>{plan.subLabel}</div>}
				</span>
				<span>{renderDisplayValueMarkdown(plan.amount.displayValue)}</span>
				<OrderReviewLineItemDelete onClick={onDeleteItem} />
			</div>
			<PlanLengthSelector onChange={changePlanLength} />
		</React.Fragment>
	);
}

function DomainItem({ item, onDeleteItem }) {
	return (
		<React.Fragment>
			<div>
				<span>
					<div>{item.label}</div>
					{item.subLabel && <div>{item.subLabel}</div>}
				</span>
				<span>{renderDisplayValueMarkdown(item.amount.displayValue)}</span>
				<OrderReviewLineItemDelete onClick={onDeleteItem} />
			</div>
		</React.Fragment>
	);
}

function UpSellCoupon({ onClick }) {
	return (
		<div>
			<h4>Exclusive offer</h4>
			<p>Buy a quick start session and get 50% off.</p>
			<a href='#' onClick={onClick}>
				Add to cart
			</a>
		</div>
	);
}
```

## 💰 Advanced API

While the `Checkout` component takes care of most everything, there are many situations where its appearance and behavior will be customized. In these cases it's appropriate to use the underlying building blocks of this package.

### Checkout

The main component in this package. It has the following props.

- locale: string (required)
- items: array (required)
- total: object (required)
- onChangeBillingContact: function
- availablePaymentMethods: array
- onSuccess: function (required)
- onFailure: function (required)
- successRedirectUrl: string (required)
- failureRedirectUrl: string (required)
- reviewContent: component
- reviewContentCollapsed: component
- upSell: component
- checkoutHeader: component
- orderReviewTOS: component
- orderReviewFeatures: component

### renderDisplayValueMarkdown(currency, displayValue)

Takes two arguments, a currency string and a displayValue string and returns the displayValue with some minor Markdown formatting. Specifically, the `~~` characters can be used to make ~~strike-through~~ text.

### formatValueForCurrency(currency, int)

Takes two arguments, a currency string and an integer string and returns the locale-specific string displayValue. For example, the arguments (`USD`, `6000`) would return the string `$60.00`.

### CheckoutProvider

Renders its `children` prop and acts as a React Context provider. All of checkout should be wrapped in this, but using the `Checkout` component will do so automatically.

### useBillingContact()

A React Hook that will return an object containing whatever data was entered in the billing contact step. Must only be used inside `CheckoutProvider`.

### usePaymentMethod()

A React Hook that will return a string containing whatever paymentMethod was entered in the payment method step. Must only be used inside `CheckoutProvider`.

### useCheckoutLineItems()

A React Hook that will return a two element array where the first element is the current array of line items (matching the `items` prop on `Checkout`), and the second element is the current total (matching the `total` prop).

### OrderReviewSection

A wrapper for a section of a list of related line items. Renders its `children` prop.

### OrderReviewLineItems

Renders a list of line items passed in the `items` prop. Each line item must have at least the props `label`, `id`, and `amount.displayValue`.

An optional boolean prop, `collapsed`, can be used to simplify the output for when the review section is collapsed.

This component provides just a simple list of label and price. If you want to modify how each line item is displayed, or if you want to provide any actions for that item (eg: the ability to delete the item from the order), you cannot use this component; instead you should create a custom component.

### OrderReviewTotal

Renders the `total` prop like a line item,  but with different styling.

An optional boolean prop, `collapsed`, can be used to simplify the output for when the review section is collapsed.

### CheckoutSubmitButton

Renders the "Pay" button. Requires a `total` prop and a `paymentMethod` prop to identify the system it should use for submitting the data. The `value` prop can be used to customize the text which by default will be "Pay " followed by `total.amount.displayValue`.

When clicked, the button will call its `onClick` prop. The parent component must then call the `submitCheckout()` function that is exported by this package which will take a specific action based on its first argument.

### submitCheckout({ paymentMethod, billingContact, items, total, onSuccess, onFailure, successRedirectUrl, failureRedirectUrl })

Calling this function (which should only be done by the `CheckoutSubmitButton`) will take a specific action based on the payment method. Has one required argument which is an object of the form: `{ paymentMethod, billingContact, items, total, onSuccess, onFailure, successRedirectUrl, failureRedirectUrl }`.

### CheckoutStep

Each of the three steps in the checkout flow will be rendered by one of these. Renders its `children` prop and includes a numbered stepper icon which corresponds to its `stepNumber` prop. Each step must also have a `title` prop for its header. Each should also include a `CheckoutNextStepButton` if there is a following step. The `collapsed` prop can be used to collapse inactive steps (they will still be rendered).

If you want to render something even when the step is collapsed (eg: a summary of the step), you can also provide the optional `collapsedContent` prop which is a component.

If a step has the `onEdit` prop, it will include an "Edit" link when collapsed which will call the `onEdit` prop function. The parent component is responsible for using this to toggle the collapsed state in an appropriate way. It should also modify the URL so that the collapsed state is serialized somehow in the URL (this allows the "Back" button to work in an expected way when collapsing and expanding steps).

### CheckoutNextStepButton

Renders a button to move to the next `CheckoutStep` component. Its `value` prop can be used to customize the text which by default will be "Continue".

### CheckoutPaymentMethods

Renders buttons for each payment method that can be used out of the array in the `availablePaymentMethods` prop. The `onChange` callback prop can be used to determine which payment method has been selected.

### CheckoutBillingContactForm

Renders the billing contact info form (typically name and address, but may also include other contact info like phone number). The fields displayed are determined by the payment method passed in as the `paymentMethod` prop.

## 💰 Styles and Themes

Each component will be styled using [styled-components](https://www.styled-components.com/) (included in this package as a [peer dependency](https://nodejs.org/en/blog/npm/peer-dependencies/)) and many of the styles will be editable by wrapping checkout in a `ThemeProvider` from that package.

For style customization beyond what is available in the theme, each component will also include a unique static className using BEM syntax.

## 💰 Credits and Coupons

Credits, coupons, and discounts are all ways that the line items and the total can be modified, so they must be handled by the parent component.
