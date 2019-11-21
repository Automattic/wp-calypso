require( '@babel/polyfill' );

/**
 * External dependencies
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { createRegistry, createPayPalMethod } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import {
	WPCOMCheckout,
	makeShoppingCartHook,
	mockCartEndpoint,
	mockPayPalExpressRequest,
} from '../src/index';

const initialCart = {
	coupon: '',
	currency: 'BRL',
	is_coupon_applied: false,
	products: [
		{
			extra: {
				context: 'signup',
				domain_registration_agreement_url:
					'https://wordpress.com/automattic-domain-name-registration-agreement/',
				privacy: true,
				privacy_available: true,
				registrar: 'KS_RAM',
			},
			free_trial: false,
			meta: 'foo.cash',
			product_id: 106,
			volume: 1,
		},
		{
			extra: {
				context: 'signup',
				domain_to_bundle: 'foo.cash',
			},
			free_trial: false,
			meta: '',
			product_id: 1009,
			volume: 1,
		},
	],
	tax: {
		display_taxes: false,
		location: {},
	},
	temporary: false,
};

const registry = createRegistry();
const { registerStore } = registry;

const useShoppingCart = makeShoppingCartHook( mockCartEndpoint, initialCart );

function App() {
	return (
		<WPCOMCheckout
			useShoppingCart={ useShoppingCart }
			availablePaymentMethods={ [
				createPayPalMethod( {
					registerStore: registerStore,
					makePayPalExpressRequest: mockPayPalExpressRequest,
				} ),
			] }
			registry={ registry }
		/>
	);
}

ReactDOM.render( <App />, document.getElementById( 'root' ) );
