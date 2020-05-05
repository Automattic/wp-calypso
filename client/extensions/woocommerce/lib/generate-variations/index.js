/**
 * External dependencies
 */

import { find, trim } from 'lodash';

/**
 * Internal dependencies
 */
import formattedVariationName from '../formatted-variation-name';

/**
 * Generates variation objects based on a product's attributes.
 *
 * @param {object} product Product object.
 * @param {Array} existingVariations Existing variations for this product.
 * @returns {Array} Array of variation objects.
 */
export default function generateVariations(
	{ name, attributes: productAttributes },
	existingVariations
) {
	const variationTypes = [];
	const variationAttributes =
		( productAttributes &&
			productAttributes.filter(
				( attribute ) => attribute.variation && attribute.name && attribute.options.length > 0
			) ) ||
		[];

	variationAttributes.forEach( function ( attribute ) {
		variationTypes.push(
			attribute.options.map( function ( option ) {
				return {
					name: attribute.name,
					option,
				};
			} )
		);
	} );

	return cartesian( ...variationTypes ).map( function ( combination ) {
		const existingVariation = findExistingVariation( existingVariations, combination );

		const id = existingVariation ? existingVariation.id : undefined;
		const sku = existingVariation ? existingVariation.sku : generateDefaultSku( name, combination );
		const attributes = existingVariation ? existingVariation.attributes : combination;
		return {
			id,
			attributes,
			sku,
		};
	} );
}

function findExistingVariation( existingVariations, combination ) {
	return find( existingVariations, ( existingVariation ) => {
		return areAttributesMatching( existingVariation.attributes, combination )
			? existingVariation
			: undefined;
	} );
}

function areAttributesMatching( attributes1, attributes2 ) {
	if ( attributes1.length !== attributes2.length ) {
		return false;
	}

	for ( let i = 0; i < attributes1.length; i++ ) {
		const a1 = attributes1[ i ];
		const a2 = find( attributes2, { name: a1.name } );

		if ( a1.option !== a2.option ) {
			return false;
		}
	}

	// Made it through all the attributes and they all checked out.
	return true;
}

function generateDefaultSku( productName, attributes ) {
	const sku =
		( ( productName && productName + '-' ) || '' ) + formattedVariationName( { attributes } );
	return trim( sku.toLowerCase().replace( /\s+/g, '-' ).replace( /-{2,}/g, '-' ) );
}

// http://stackoverflow.com/a/29585704
function cartesian( ...arrays ) {
	let i, j, l, m;
	const o = [];

	if ( ! arrays || arrays.length === 0 ) {
		return arrays;
	}
	const array1 = arrays.splice( 0, 1 )[ 0 ];
	arrays = cartesian( ...arrays );
	for ( i = 0, l = array1.length; i < l; i++ ) {
		if ( arrays && arrays.length ) {
			for ( j = 0, m = arrays.length; j < m; j++ ) {
				o.push( [ array1[ i ] ].concat( arrays[ j ] ) );
			}
		} else {
			o.push( [ array1[ i ] ] );
		}
	}
	return o;
}
