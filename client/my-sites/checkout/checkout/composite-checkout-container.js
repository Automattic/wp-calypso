/**
 * External dependencies
 */
import React from 'react';
import { createRegistry, createPayPalMethod } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import {
	WPCOMCheckout,
	makeShoppingCartHook,
	mockPayPalExpressRequest,
} from 'lib/composite-checkout-wpcom';

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
			meta: 'asdkfjalsdkjfalsdjkflaksdjflkajsdfffd.com',
			product_id: 106,
			volume: 1,
		},
		{
			extra: {
				context: 'signup',
				domain_to_bundle: 'asdkfjalsdkjfalsdjkflaksdjflkajsdfffd.com',
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

const wpcom = wp.undocumented();

const useShoppingCart = makeShoppingCartHook(
	( cartKey, cartParam ) => wpcom.setCart( cartKey, cartParam ),
	initialCart
);

export default function CompositeCheckoutContainer() {
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
