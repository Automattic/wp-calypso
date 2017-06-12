/**
 * External dependencies
 */
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import formattedVariationName from '../formatted-variation-name';

/**
 * Generates variation objects based on a product's attributes.
 *
 * @param {Object} product Product object.
 * @return {Array} Array of variation objects.
 */
export default function generateVariations( { name, attributes } ) {
	const variationTypes = [];
	const variationAttributes = (
		attributes &&
		attributes.filter( attribute => attribute.variation && attribute.name && attribute.options.length > 0 )
	) || [];

	variationAttributes.forEach( function( attribute ) {
		variationTypes.push( attribute.options.map( function( option ) {
			return {
				name: attribute.name,
				option,
			};
		} ) );
	} );

	return cartesian( ...variationTypes ).map( function( combination ) {
		const sku = generateDefaultSku( name, combination );
		return {
			attributes: combination,
			sku,
		};
	} );
}

function generateDefaultSku( productName, attributes ) {
	const sku = ( productName && ( productName + '-' ) || '' ) + formattedVariationName( { attributes } );
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
