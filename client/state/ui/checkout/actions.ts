/**
 * External dependencies
 */
import { AnyAction } from 'redux';

/**
 * Internal dependencies
 */
import {
	CHECKOUT_REDIRECT_PRODUCT_SET,
	CHECKOUT_REDIRECT_PRODUCT_RESET,
} from 'calypso/state/action-types';

export function setCheckoutRedirectProduct( product: string ): AnyAction {
	return {
		type: CHECKOUT_REDIRECT_PRODUCT_SET,
		product,
	};
}

export function resetCheckoutRedirectProduct(): AnyAction {
	return {
		type: CHECKOUT_REDIRECT_PRODUCT_RESET,
	};
}
