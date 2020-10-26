# Credit Card Form

This component is used to display a credit card form.

## How to use

```js
import CreditCardForm from 'calypso/blocks/credit-card-form';

function render() {
	return (
		<CreditCardForm
			createCardToken={ createCardToken }
			initialValues={ initialValues }
			recordFormSubmitEvent={ noop }
			saveStoredCard={ saveStoredCard }
			successCallback={ noop }
		/>
	);
}
```

## Props

- `createCardToken`: Function to be executed when a valid form is submitted. It is responsible for a credit card token creation which is the part of the flow.
- `initialValues`: Optional object containing initial values for the form fields. At the moment only `name` is supported.
- `purchase`: Optional object representing an existing purchase that the credit card will be used for. If this is passed along with `siteSlug` and if the purchase is up for renewal, the message that is displayed after successfully saving the card will give the user information about renewing the purchase with the new credit card.
- `recordFormSubmitEvent`: Function to be executed when the user clicks the _Save Card_ button.
- `saveStoredCard`: Optional function returning _Promise_ to be executed when a credit card token is created after the user clicked the _Save Card_ button. By default `wpcom.updateCreditCard` Redux action is executed because of legacy reasons.
- `siteSlug`: Optional site slug that the `purchase` can be renewed for.
- `successCallback`: Function to be executed when a credit card is successfully stored.
- `autoFocus`: Whether the first field (cardholder name) should steal the focus when this component is rendered. Default `true`.
