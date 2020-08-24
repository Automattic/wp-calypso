/**
 * External dependencies
 */
import { isNumber, isUndefined, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchWithProps } from 'woocommerce/state/helpers';
import { del, get, post, put } from 'woocommerce/state/data-layer/request/actions';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import { productVariationUpdated } from 'woocommerce/state/sites/product-variations/actions';
import {
	WOOCOMMERCE_PRODUCT_VARIATION_CREATE,
	WOOCOMMERCE_PRODUCT_VARIATION_UPDATE,
	WOOCOMMERCE_PRODUCT_VARIATION_DELETE,
	WOOCOMMERCE_PRODUCT_VARIATIONS_REQUEST,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_PRODUCT_VARIATION_CREATE ]: [ handleProductVariationCreate ],
	[ WOOCOMMERCE_PRODUCT_VARIATION_UPDATE ]: [ handleProductVariationUpdate ],
	[ WOOCOMMERCE_PRODUCT_VARIATION_DELETE ]: [ handleProductVariationDelete ],
	[ WOOCOMMERCE_PRODUCT_VARIATIONS_REQUEST ]: [ handleProductVariationsRequest ],
};

export function handleProductVariationsRequest( store, action ) {
	const { siteId, productId, successAction, failureAction } = action;

	const updatedAction = ( dispatch, getState, { data } ) => {
		data.map( ( variation ) => {
			return dispatch( productVariationUpdated( siteId, productId, variation, action ) );
		} );

		const props = { productId, receivedData: data };
		dispatchWithProps( dispatch, getState, successAction, props );
	};

	const endpoint = 'products/' + productId + '/variations?per_page=100';
	store.dispatch( get( siteId, endpoint, updatedAction, failureAction ) );
}

export function handleProductVariationCreate( store, action ) {
	const { siteId, productId, variation, successAction, failureAction } = action;

	// Filter out any id we might have.
	const { id, ...variationData } = variation;

	if ( isNumber( id ) ) {
		store.dispatch(
			setError( siteId, action, {
				message: 'Attempting to create a variation which already has a valid id.',
				variation,
			} )
		);
		return;
	}

	const updatedAction = ( dispatch, getState, { data } ) => {
		dispatch( productVariationUpdated( siteId, productId, data, action ) );

		const props = { productId, sentData: variation, receivedData: data };
		dispatchWithProps( dispatch, getState, successAction, props );
	};

	const endpoint = 'products/' + productId + '/variations';
	store.dispatch( post( siteId, endpoint, variationData, updatedAction, failureAction ) );
}

export function handleProductVariationUpdate( store, action ) {
	const { siteId, productId, variation, successAction, failureAction } = action;

	// Ensure we have a valid id.
	if ( ! isNumber( variation.id ) ) {
		store.dispatch(
			setError( siteId, action, {
				message: 'Attempting to update a variation without a valid id.',
				variation,
			} )
		);
		return;
	}

	const updatedAction = ( dispatch, getState, { data } ) => {
		dispatch( productVariationUpdated( siteId, productId, data, action ) );

		const props = { productId: productId, sentData: variation, receivedData: data };
		dispatchWithProps( dispatch, getState, successAction, props );
	};

	const data = mapValues( variation, ( value ) => {
		// JSON doesn't allow undefined,
		// so change it to empty string for properties to be removed.
		if ( isUndefined( value ) ) {
			return '';
		}
		return value;
	} );

	const endpoint = 'products/' + productId + '/variations/' + variation.id;
	store.dispatch( put( siteId, endpoint, data, updatedAction, failureAction ) );
}

export function handleProductVariationDelete( store, action ) {
	const { siteId, productId, variationId, successAction, failureAction } = action;

	// Ensure we have a valid id.
	if ( ! isNumber( variationId ) ) {
		store.dispatch(
			setError( siteId, action, {
				message: 'Attempting to delete a variation without a valid id.',
				variationId,
			} )
		);
		return;
	}

	const updatedAction = ( dispatch, getState, data ) => {
		dispatch( productVariationUpdated( siteId, productId, variationId, action ) );

		const props = { productId, sentData: { id: variationId }, receivedData: data };
		dispatchWithProps( dispatch, getState, successAction, props );
	};

	const endpoint = 'products/' + productId + '/variations/' + variationId;
	store.dispatch( del( siteId, endpoint, updatedAction, failureAction ) );
}
