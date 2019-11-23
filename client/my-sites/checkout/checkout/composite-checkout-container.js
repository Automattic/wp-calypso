/**
 * External dependencies
 */
import React from 'react';
import { createRegistry, createPayPalMethod } from '@automattic/composite-checkout';
import {
	WPCOMCheckout,
	makeShoppingCartHook,
	mockPayPalExpressRequest,
} from '@automattic/composite-checkout-wpcom';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';

const registry = createRegistry();
const { registerStore } = registry;

const wpcom = wp.undocumented();

export const getServerCart = wpcom.getCart;

const useShoppingCart = cartKey =>
	makeShoppingCartHook(
		cartParam => wpcom.setCart( cartKey, cartParam ),
		() => wpcom.getCart( cartKey )
	);

export function CompositeCheckoutContainer( { siteSlug } ) {
	return (
		<WPCOMCheckout
			useShoppingCart={ useShoppingCart( siteSlug ) }
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

export const getCompositeCheckoutContainer = cartKey => {};
