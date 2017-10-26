Credit Card Form
=========

This component is used to display a credit card form.

#### How to use:

```js
import CreditCardForm from 'blocks/credit-card-form';

render() {
	return (
		<CreditCardForm
			createCardToken={ createCardToken }
			initialValues={ initialValues }
			recordFormSubmitEvent={ noop }
			saveStoredCard={ saveStoredCard }
			successCallback={ noop } />
	);
}
```

#### Props

* `createCardToken`: Function to be executed when a valid form is submitted. It is responsible of a credit card token creation which is the part of the flow.
* `initialValues`: Optional object containing initial values for the form fields. At the moment only `name` is supported.
* `recordFormSubmitEvent`: Function to be executed when the user clicks the _Save Card_ button.
* `saveStoredCard`: Optional function returning _Promise_ to be executed when a credit card token is created after the user clicked the _Save Card_ button. By default `wpcom.updateCreditCard` Redux action is executed because of legacy reasons.
* `successCallback`: Function to be executed when a credit card is successfully stored.
