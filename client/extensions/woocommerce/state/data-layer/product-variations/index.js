/**
 * External dependencies
 */
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchWithProps } from 'woocommerce/state/helpers';
import { get, post } from 'woocommerce/state/data-layer/request/actions';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import { productVariationUpdated } from 'woocommerce/state/sites/product-variations/actions';
import {
	WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
	WOOCOMMERCE_PRODUCT_VARIATIONS_REQUEST,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_PRODUCT_VARIATION_CREATE ]: [ handleProductVariationCreate ],
	[ WOOCOMMERCE_PRODUCT_VARIATIONS_REQUEST ]: [ handleProductVariationsRequest ],
};

export function handleProductVariationsRequest( store, action ) {
	const { siteId, productId, successAction, failureAction } = action;

	const updatedAction = ( dispatch, getState, { data } ) => {
		data.map( ( variation ) => {
			return dispatch( productVariationUpdated(
				siteId, productId, variation, action
			) );
		} );

		const props = { productId, receivedData: data };
		dispatchWithProps( dispatch, getState, successAction, props );
	};

	const endpoint = 'products/' + productId + '/variations';
	store.dispatch( get( siteId, endpoint, updatedAction, failureAction ) );
}

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

		const props = { productId: action.productId, sentData: action.variation, receivedData: data };
		dispatchWithProps( dispatch, getState, successAction, props );
	};

	const endpoint = 'products/' + productId + '/variations';
	store.dispatch( post( siteId, endpoint, variationData, updatedAction, failureAction ) );
}
