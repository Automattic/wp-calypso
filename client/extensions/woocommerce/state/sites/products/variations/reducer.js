/**
 * External dependencies
 */
import { isEqual } from 'lodash';

export function variationUpdated( state, action ) {
	const { data } = action;
	const variations = state && state.variations || [];

	return { ...state,
		variations: updateCachedVariation( variations, data ),
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
