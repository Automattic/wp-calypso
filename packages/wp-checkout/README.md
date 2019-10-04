# WP Checkout

A set of React components, custom Hooks, and helper functions that together can be used to create a purchase and checkout flow.

## Usage

This package provides a main component, `WPCheckout`, which creates the checkout form.

The form has three steps:

1. Payment method
2. Billing details
3. Review order

### Select payment method

The payment methods displayed in the first step are chosen from an optional array called `availablePaymentMethods`, which in turn is selected from the following options:

- 'apple-pay'
- 'card'
- 'paypal'
- 'ebanx'
- 'ideal'

The actual payment method options displayed on the form are chosen automatically by the component based on the environment, locale, and possibly other factors, but they will include only methods in the `availablePaymentMethods` array.

The content of the second and third step vary based on the payment method chosen in the first step. For example, the second step may only request a postal code if the payment method is 'apple-pay', but it may request the full address for the 'card' method.

### Billing details

An initial billing address can be optionally provided using the `defaultBillingContact` prop on `WPCheckout`. It should be an object whose properties vary based on the expected fields in the second step. The full set of properties can be seen in the example below.

If the billing address is set or changed during the second step, the updated address will be used for the checkout automatically without mutating the `defaultBillingContact` prop. However, as a side effect, the optional `onChangeBillingContact` prop will be called with the updated address object so that the parent component can update any associated records.

Any change to the `defaultBillingContact` prop while the component is visible will be treated as new default field values, but will not override anything that was typed in the form.

### Review order

The third step's order review content can be overridden using the `orderReview` prop, which can be built from a set of building blocks provided by this package. See the example below for how to create a custom review area.

The line items being purchased must be passed to `WPCheckout` using the required `items` array prop. Each item is an object of the form `{label: string, subLabel: string, id: string, amount: {currency: string, value: int, displayValue: string}}`. All the properties are required except for `subLabel`. If any event in the form causes the line items to change (for example, deleting something during the review step), the `items` will not be mutated; instead, the component will call the `onChangeItems` prop of `WPCheckout` with a modified copy of `items`. It is incumbent on the parent component to use `onChangeItems` to create a modified line item list and then return it to `WPCheckout`.

The line items are mostly for display purposes only. The actual charge is performed on the sum of the totals, which must be passed separately to `WPCheckout` using the required `totals` array prop. Each total in this array has a type in the set of 'subtotal', or 'tax', which defines its role and how it will be displayed. There can be multiple totals of each type and they will be added together (for example, multiple taxes). Totals are objects of the form `{type: string, label: string, amount: { currency: string, value: int, displayValue: string }}`. If the `onChangeItems` callback is called, the parent component must also update the `totals` prop.

The `displayValue` property of both items and totals can use limited Markdown formatting, including the `~` character for strike-through text.

There are two other optional props which allow customizing the contents of the form. `orderReviewTOS` is displayed just below the payment button, and `orderReviewFeatures` may be displayed (depending on the available screen space) adjacent to the form.

Any component within `WPCheckout` can use the custom React Hook `useCheckoutLineItems`, which returns a three element array where the first element is the current array of line items (matching the `items` prop on `WPCheckout`), the second element is the current array of totals (matching the `totals` prop), and the third element is a function that will attempt to change the array of line items (it will call the `onChangeItems` prop on `WPCheckout` which should do whatever is necessary to update the `items` prop). Rememeber that if `onChangeItems` is called, it's important for the parent to also update the totals.

### Submitting the form

When the payment button is pressed, the form data will be validated and submitted in a way appropriate to the payment method. If there is a problem with either validation or submission, or if the payment method's service returns an error, the `onFailure` prop on `WPCheckout` will be called with an object describing the error.

If the payment method succeeds, the `onSuccess` prop will be called instead. It's important not to provision anything based on this callback, as it could be called by a malicious user. Instead, provisioning should be handled separately server-to-server.

Some payment methods may require a redirect to an external site. If that occurs, the `failureRedirectUrl` and `successRedirectUrl` props on `WPCheckout` will be used instead of the `onFailure` and `onSuccess` callbacks. All four props are required.

## ✅ Example

The following example demonstrates a full checkout page using many of the options available.

```js
import React, { useState } from 'react';
import { WPCheckout, useCheckoutLineItems, OrderReviewLineItems, OrderReviewSection, OrderReviewTotals } from 'wp-checkout';
import { PlanLengthSelector, splitCheckoutLineItemsByType } from 'wp-checkout/wpcom';

const initialItems = [
	{label: 'WordPress.com Personal Plan', id: 'wpcom-personal', amount: {currency: 'USD', value: 6000, displayValue: '$60'}},
	{label: 'Domain registration', subLabel: 'example.com', id: 'wpcom-domain', amount: {currency: 'USD', value: 0, displayValue: '~$17~ 0'}},
];
const defaultBillingContact = {
	billingName: 'Anne Varney',
	postalCountry: 'US',
	postalCode: '18104',
	postalAddress: '1960 W CHELSEA AVE STE 2006R',
	postalCity: 'Allentown',
	postalState: 'PA',
};

// These will only be shown if appropriate and can be used to disable certain
payment methods for testing or other purposes.
const availablePaymentMethods = ['apple-pay', 'card', 'paypal', 'ebanx', 'ideal' ];

// These are used only for non-redirect payment methods
const onSuccess = () => console.log('Payment succeeded!');
const onFailure = error => console.error('There was a problem with your payment', error)

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

// Certain blocks have a default component but can be overridden to provide custom implementations
const orderReview = <OrderReview />;
const upSell = <UpSellCoupon />;

function MyCheckout() {
	const [items, setItems] = useState(initialItems);
	const [totals, setTotals] = useState(calculateTotalsForItems(initialItems));

	// Keep totals up-to-date when items change
	useEffect(() => {
		setTotals(calculateTotalsForItems(items));
	}, [items])

	return <WPCheckout
		locale={'US'}
		items={items}
		totals={totals}
		defaultBillingContact={defaultBillingContact}
		availablePaymentMethods={availablePaymentMethods}
		onSuccess={onSuccess}
		onFailure={onFailure}
		successRedirectUrl={successRedirectUrl}
		failureRedirectUrl={failureRedirectUrl}
		onChangeItems={setItems}
		orderReview={orderReview}
		upSell={upSell}
	/>;
}

function OrderReview() {
	const [items] = useCheckoutLineItems();
	const { planItems, domainItems } = splitCheckoutLineItemsByType(items);

	return <React.Fragment>
		<OrderReviewSection>
			<OrderReviewLineItems items={planItems} />
			<PlanLengthSelector />
		</OrderReviewSection>
		<OrderReviewSection>
			<OrderReviewLineItems items={domainItems} />
		</OrderReviewSection>
		<OrderReviewSection>
			<OrderReviewTotals />
		</OrderReviewSection>
	</React.Fragment>;
}

function UpSellCoupon() {
	const [items, , setItems] = useCheckoutLineItems();
	const quickStartItem = {label: 'Quick Start', id: 'quickstart', amount: {currency: 'USD', value: 2500, displayValue: '~$50~ $25'}};
	const addQuickStart = () => setItems([...items, quickStartItem]);

	return <React.Fragment>
		<h4>Exclusive offer</h4>
		<p>Buy a quick start session and get 50% off.</p>
		<a href='#' onClick={addQuickStart}>Add to cart</a>
	</React.Fragment>;
}

function calculateTotalsForItems(items) {
	const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
	const currency = items.reduce((lastCurrency, item) => item.currency, 'USD');
	const taxRate = 0.09;
	const taxes = taxRate * subtotal;

	return [
		{label: 'Subtotal', type: 'subtotal', amount: {currency: 'USD', value: subtotal, displayValue: getDisplayValueForCurrency(currency, subtotal)}},
		{label: 'Taxes', type: 'tax', amount: {amount: currency: 'USD', value: taxes, displayValue: getDisplayValueForCurrency(currency, taxes)}},
	];
}
```

## ⚠️ 👷‍♀️ To do ⚠️

### Taxes

Can the component handle calculating taxes automatically? If so, we can also calculate the subtotal automatically and probably remove the need for the `totals` prop entirely. That would be a big win for simplifying the API.

### Credits

Where does our component learn about credits? How are partial credits displayed in the review step and is the math for them done automatically?

### Coupons

How does our component manage coupons? Can it perform the math for them automatically?

### OrderReviewLineItems customization

What if we want to customize the markup in an individual line item (like a highlighted "free for one year!" comment)? Perhaps we can allow special Markdown in the `label` property of the item itself like we do with the `displayValue`?

### Header customization

The "Complete your purchase" header at the top of the component could also be a customizable slot, so that it's possible to include a domain name there if the purchase includes one.
