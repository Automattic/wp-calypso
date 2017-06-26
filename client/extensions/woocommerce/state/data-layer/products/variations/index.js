/**
 * External dependencies
 */
import { isFunction, isNumber, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import { post } from 'woocommerce/state/data-layer/request/actions';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import { productVariationUpdated } from 'woocommerce/state/sites/products/variations/actions';
import {
	WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_PRODUCT_VARIATION_CREATE ]: [ handleProductVariationCreate ],
};

export function handleProductVariationCreate( store, action ) {
	const { siteId, productId, variation, successAction, failureAction } = action;

	// Filter out any id we might have.
	const { id, ...variationData } = variation;

	if ( isNumber( id ) ) {
		store.dispatch( setError( siteId, action, {
			message: 'Attempting to create a variation which already has a valid id.',
			variation,
		} ) );
		return;
	}

	const updatedAction = ( dispatch, getState, data ) => {
		dispatch( productVariationUpdated( siteId, data, action ) );

		// TODO: Make this a utility function.
		if ( isFunction( successAction ) ) {
			dispatch( successAction( dispatch, getState, productId, action.variation, data ) );
		} else if ( isObject( successAction ) ) {
			dispatch( { ...successAction, productId, sentData: action.variation, receivedData: data } );
		}
	};

	const endpoint = 'products/' + productId + '/variations';
	store.dispatch( post( siteId, endpoint, variationData, updatedAction, failureAction ) );
}
