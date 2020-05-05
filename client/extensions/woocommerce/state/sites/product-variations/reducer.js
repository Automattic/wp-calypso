/**
 * External dependencies
 */

import { compact, isEqual, isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import { WOOCOMMERCE_PRODUCT_VARIATION_UPDATED } from 'woocommerce/state/action-types';

export default withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_PRODUCT_VARIATION_UPDATED:
			return variationUpdated( state, action );
	}

	return state;
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
	// If variation is just the numeric id, we should delete it.
	const shouldDelete = isNumber( variation );
	const variationId = shouldDelete ? variation : variation.id;
	const newVariation = ! shouldDelete && variation;

	let found = false;
	const newVariations = compact(
		variations.map( ( v ) => {
			if ( isEqual( v.id, variationId ) ) {
				found = true;
				return newVariation;
			}
			return v;
		} )
	);

	if ( ! found ) {
		newVariations.push( variation );
	}

	return newVariations;
}
