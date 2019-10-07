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

The billing address may be automatically filled based on the server. If the billing address is set or changed during the second step, the updated address will be used for the checkout. However, as a side effect, the optional `onChangeBillingContact` prop will be called with the updated address object so that the parent component can take any neccessary actions like updating the line items and total.

### Review order

The third step's order review content can be overridden using the `orderReview` prop, which can be built from a set of building blocks provided by this package. See the example below for how to create a custom review area.

The line items being purchased must be passed to `WPCheckout` using the required `items` array prop. Each item is an object of the form `{label: string, subLabel: string, id: string, type: string, amount: { currency: string, value: int, displayValue: string } }`. All the properties are required except for `subLabel` and `id` must be unique. The `type` property is not used internally but can be used to organize the line items in the `orderReview` component. If any event in the form causes the line items to change (for example, deleting something during the review step), the `items` should not be mutated. It is incumbent on the parent component to create a modified line item list and then return it to `WPCheckout`.

The line items are for display purposes only. They should also include subtotals, discounts, and taxes. No math will be performed on the line items. Instead, the amount to be charged will be specified by the required prop `total`, which is an object (very similar to the line items) of the form `{ label: string, subLabel: string, amount: { currency: string, value: int, displayValue: string } }`.

The `displayValue` property of both items and the total can use limited Markdown formatting, including the `~` character for strike-through text, if passed through the `formatDisplayValueForCurrency()` helper.

There are two other optional props which allow customizing the contents of the form. `orderReviewTOS` is displayed just below the payment button, and `orderReviewFeatures` may be displayed (depending on the available screen space) adjacent to the form.

Any component within `WPCheckout` can use the custom React Hook `useCheckoutLineItems`, which returns a two element array where the first element is the current array of line items (matching the `items` prop on `WPCheckout`), the second element is the current total (matching the `total` prop).

### Submitting the form

When the payment button is pressed, the form data will be validated and submitted in a way appropriate to the payment method. If there is a problem with either validation or submission, or if the payment method's service returns an error, the `onFailure` prop on `WPCheckout` will be called with an object describing the error.

If the payment method succeeds, the `onSuccess` prop will be called instead. It's important not to provision anything based on this callback, as it could be called by a malicious user. Instead, provisioning should be handled separately server-to-server.

Some payment methods may require a redirect to an external site. If that occurs, the `failureRedirectUrl` and `successRedirectUrl` props on `WPCheckout` will be used instead of the `onFailure` and `onSuccess` callbacks. All four props are required.

## ✅ Example

The following example demonstrates a full checkout page using many of the options available.

```js
import React, { useState } from 'react';
import { WPCheckout, useCheckoutLineItems, OrderReviewLineItems, OrderReviewSection, OrderReviewTotal, OrderReviewLineItemDelete, renderDisplayValueMarkdown } from 'wp-checkout';
import { PlanLengthSelector, splitCheckoutLineItemsByType, formatDisplayValueForCurrency, adjustItemPricesForCountry } from 'wp-checkout/wpcom';

const initialItems = [
	{ label: 'WordPress.com Personal Plan', id: 'wpcom-personal', type: 'plan', amount: { currency: 'USD', value: 6000, displayValue: '$60' } },
	{ label: 'Domain registration', subLabel: 'example.com', id: 'wpcom-domain', type: 'domain-reg', amount: { currency: 'USD', value: 0, displayValue: '~$17~ 0' } },
	{ label: 'Taxes', id: 'wpcom-taxes', type: 'tax', amount: { currency: 'USD', value: 516, displayValue: '$5.16' } },
];

// These will only be shown if appropriate and can be used to disable certain payment methods for testing or other purposes.
const availablePaymentMethods = ['apple-pay', 'card', 'paypal', 'ebanx', 'ideal'];

// These are used only for non-redirect payment methods
const onSuccess = () => console.log('Payment succeeded!');
const onFailure = error => console.error('There was a problem with your payment', error);

// These are used only for redirect payment methods
const successRedirectUrl = window.location.href;
const failureRedirectUrl = window.location.href;

function MyCheckout() {
	const [items, setItems] = useState(initialItems);
	const onDeleteItem = itemToDelete => setItems(items.filter(item => item.id === itemToDelete.id));

	// Certain blocks have a default component but can be overridden to provide custom implementations
	const orderReview = <OrderReview onDeleteItem={onDeleteItem} />;
	const upSell = <UpSellCoupon setItems={setItems} />;

	const lineItemTotal = items.reduce((sum, item) => sum + item.amount.value, 0);
	const currency = items.reduce((lastCurrency, item) => item.amount.currency, 'USD');
	const total = { label: 'Total', amount: { currency, value: lineItemTotal, displayValue: formatDisplayValueForCurrency( currency, lineItemTotal ) } };

	const updatePricesForAddress = address => setItems(adjustItemPricesForCountry(items, address.country));

	return (
		<WPCheckout
			locale={'US'}
			items={items}
			total={total}
			onChangeBillingContact={updatePricesForAddress}
			availablePaymentMethods={availablePaymentMethods}
			onSuccess={onSuccess}
			onFailure={onFailure}
			successRedirectUrl={successRedirectUrl}
			failureRedirectUrl={failureRedirectUrl}
			orderReview={orderReview}
			upSell={upSell}
		/>
	);
}

function OrderReview({ onDeleteItem }) {
	const [items] = useCheckoutLineItems();
	const { planItems, domainItems, taxItems } = splitCheckoutLineItemsByType(items);

	return (
		<React.Fragment>
			<OrderReviewSection>
				{planItems.map(plan => (
					<PlanItem key={plan.id} plan={plan} onDeleteItem={onDeleteItem} />
				))}
				<PlanLengthSelector />
			</OrderReviewSection>
			<OrderReviewSection>
				<OrderReviewLineItems items={domainItems} />
			</OrderReviewSection>
			<OrderReviewSection>
				<OrderReviewLineItems items={taxItems} />
				<OrderReviewTotal />
			</OrderReviewSection>
		</React.Fragment>
	);
}

function PlanItem({ plan, onDeleteItem }) {
	return (
		<div>
			<span>{plan.label}</span>
			<span>{renderDisplayValueMarkdown(plan.amount.displayValue)}</span>
			<OrderReviewLineItemDelete onClick={onDeleteItem} />
		</div>
	);
}

function UpSellCoupon({ setItems }) {
	const [items] = useCheckoutLineItems();
	const quickStartItem = { label: 'Quick Start', id: 'quickstart', amount: { currency: 'USD', value: 2500, displayValue: '~$50~ $25' } };
	const addQuickStart = () => setItems([...items, quickStartItem]);

	return (
		<React.Fragment>
			<h4>Exclusive offer</h4>
			<p>Buy a quick start session and get 50% off.</p>
			<a href='#' onClick={addQuickStart}>
				Add to cart
			</a>
		</React.Fragment>
	);
}
```

## ⚠️ 👷‍♀️ To do ⚠️

### Taxes

Can the component handle calculating taxes automatically? If so, we can also calculate the subtotal automatically and probably remove the need for the `total` prop entirely. That would be a big win for simplifying the API.

### Credits

Where does our component learn about credits? How are partial credits displayed in the review step and is the math for them done automatically?

### Coupons

How does our component manage coupons? Can it perform the math for them automatically?

### Header customization

The "Complete your purchase" header at the top of the component could also be a customizable slot, so that it's possible to include a domain name there if the purchase includes one.
