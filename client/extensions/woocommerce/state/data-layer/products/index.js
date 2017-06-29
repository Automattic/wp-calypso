/**
 * External dependencies
 */
import { isFunction, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { post } from 'woocommerce/state/data-layer/request/actions';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import { productUpdated } from 'woocommerce/state/sites/products/actions';
import {
	WOOCOMMERCE_PRODUCT_CREATE,
} from 'woocommerce/state/action-types';

export function handleProductCreate( store, action ) {
	const { siteId, product, successAction, failureAction } = action;

	// Filter out any id we might have.
	const { id, ...productData } = product;

	if ( typeof id === 'number' ) {
		store.dispatch( setError( siteId, action, {
			message: 'Attempting to create a product which already has a valid id.',
			product,
		} ) );
		return;
	}

	const updatedAction = ( dispatch, getState, data ) => {
		dispatch( productUpdated( siteId, data, action ) );

		// TODO: Make this a utility function.
		if ( isFunction( successAction ) ) {
			dispatch( successAction( dispatch, getState, action.product, data ) );
		} else if ( isObject( successAction ) ) {
			dispatch( { ...successAction, sentData: action.product, receivedData: data } );
		}
	};

	store.dispatch( post( siteId, 'products', productData, updatedAction, failureAction ) );
}

export default {
	[ WOOCOMMERCE_PRODUCT_CREATE ]: [ handleProductCreate ],
};

