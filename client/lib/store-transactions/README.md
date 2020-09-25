# store-transactions

This module contains functions for creating WordPress.com Store transactions using the `POST /transactions` endpoint.

## API

### submit( params )

## Examples

### User with a Stored Card

```jsx
const steps = submit( {
	cart: cartValue,
	payment: {
		paymentMethod: 'WPCOM_Billing_MoneyPress_Stored',
		moneyPressReference: 'some Paygate token',
	},
} );
```

### User with a New Card

```jsx
const steps = submit( {
	cart: cartValue,
	payment: {
		paymentMethod: 'WPCOM_Billing_MoneyPress_Paygate',
		newCardDetails: {
			name: 'John Smith',
			number: '4111111111111111',
			cvc: '123',
			'expiration-date': '0115',
			'postal-code': '94705',
		},
	},
} );
```

### User Paying Fully with Credits

```jsx
const steps = submit( {
	cart: cartValue,
	payment: {
		paymentMethod: 'WPCOM_Billing_WPCOM',
	},
} );
```

## Transaction Flow Steps

### New Credit Card

1. input-validation
2. submitting-payment-key-request
3. received-payment-key-response
4. submitting-wpcom-request
5. received-wpcom-response (also includes `step.data`)

### Stored Credit Card or Full Credits

1. input-validation
2. submitting-wpcom-request
3. received-wpcom-response (also includes `step.data`)
