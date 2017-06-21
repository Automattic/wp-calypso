/**
 * Internal dependencies
 */
import { post } from 'woocommerce/state/data-layer/request/actions';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import { productUpdated } from 'woocommerce/state/sites/products/actions';
import {
	WOOCOMMERCE_PRODUCT_CREATE,
	WOOCOMMERCE_PRODUCT_UPDATED,
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

	const updatedAction = productUpdated( siteId, null, successAction ); // data field will be filled in by request.
	dispatch( post( siteId, 'products', productData, updatedAction, failureAction ) );
}

export function handleProductUpdated( { dispatch }, action ) {
	const { completionAction } = action;

	completionAction && dispatch( completionAction );
}

export default {
	[ WOOCOMMERCE_PRODUCT_CREATE ]: [ handleProductCreate ],
	[ WOOCOMMERCE_PRODUCT_UPDATED ]: [ handleProductUpdated ],
};

