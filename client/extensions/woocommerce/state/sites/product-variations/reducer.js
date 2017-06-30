/**
 * External dependencies
 */
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_PRODUCT_VARIATION_UPDATED,
} from 'woocommerce/state/action-types';

export default createReducer( {}, {
	[ WOOCOMMERCE_PRODUCT_VARIATION_UPDATED ]: variationUpdated,
} );

export function variationUpdated( state, action ) {
	const { productId, data } = action;
	const variations = state || {};
	const productVariations = variations[ productId ] || [];

	return {
		...variations,
		[ productId ]: updateCachedVariation( productVariations, data ),
	};
}

function updateCachedVariation( variations, variation ) {
	let found = false;
	const newVariations = variations.map( ( v ) => {
		if ( isEqual( v.id, variation.id ) ) {
			found = true;
			return variation;
		}
		return v;
	} );

	if ( ! found ) {
		newVariations.push( variation );
	}

	return newVariations;
}
