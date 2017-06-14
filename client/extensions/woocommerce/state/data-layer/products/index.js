/**
 * Internal dependencies
 */
import { post } from 'woocommerce/state/data-layer/request/actions';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import {
	WOOCOMMERCE_PRODUCT_CREATE,
} from 'woocommerce/state/action-types';

export function handleProductCreate( { dispatch }, action ) {
	const { siteId, product, successAction, failureAction } = action;

	// Filter out any id we might have.
	const { id, ...productData } = product;

	if ( typeof id === 'number' ) {
		dispatch( setError( siteId, action, {
			message: 'Attempting to create a product which already has a valid id.',
			product,
		} ) );
		return;
	}

	dispatch( post( siteId, 'products', productData, successAction, failureAction ) );
}

export default {
	[ WOOCOMMERCE_PRODUCT_CREATE ]: [ handleProductCreate ],
};

