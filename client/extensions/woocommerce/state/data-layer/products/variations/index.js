/**
 * External dependencies
 */
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchWithProps } from 'woocommerce/state/helpers';
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

		const props = { productId: action.productId, sentData: action.variation, receivedData: data };
		dispatchWithProps( dispatch, getState, successAction, props );
	};

	const endpoint = 'products/' + productId + '/variations';
	store.dispatch( post( siteId, endpoint, variationData, updatedAction, failureAction ) );
}
