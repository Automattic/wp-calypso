# Payment Gateway Loader

Payment gateways often provide JS libraries used to securely generate tokens from credit card details.
For example, `Paygate` is a library by WordPress.com we can use to send Credit card data to the Paygate server and recieve back a token which we then submit to MoneyPress.

This class, `PaymentGatewayLoader`, takes care of the details of loading the remote payment gateway JS script (i.e. `paygate.js`) asynchronously.
You can access the `Paygate` class from within the callback of `PaygateLoader.ready` like so:

```js
import paymentGatewayLoader from 'calypso/lib/payment-gateway-loader';

function onSuccess( token ) {
	// Do something with the Paygate token
}

function onError( error ) {
	// Uhoh! We couldn't get a token for some reason
}

paymentGatewayLoader.ready( url, 'Paygate', function ( Paygate ) {
	const card = {
		name: 'WordPress User',
		number: '4111111111111111',
		cvc: '111',
		exp_month: '02',
		exp_year: '2017',
	};

	Paygate.create_token( card, onSuccess, onError );
} );
```
