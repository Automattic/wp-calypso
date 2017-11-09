/** @format */

/**
 * External dependencies
 */
import { difference, filter, isArray, uniq } from 'lodash';

export function productContainsString( product, textString ) {
	const matchString = textString.trim().toLocaleLowerCase();

	if ( -1 < product.name.toLocaleLowerCase().indexOf( matchString ) ) {
		// found in product name
		return true;
	}

	const attributes = filter( product.attributes, { variation: true } );
	const attrString = attributes.map( attr => attr.options.join( ' ' ) ).join( ' ' );
	if ( -1 < attrString.toLocaleLowerCase().indexOf( matchString ) ) {
		// found in attributes
		return true;
	}
	return false;
}

export function isProductSelected( value = [], productId ) {
	if ( isArray( value ) && value.length ) {
		return -1 !== value.indexOf( productId );
	}
	return value === productId;
}

export function isVariableProduct( product ) {
	return 'variable' === product.type && ! product.isVariation;
}

export function addProductId( value = [], productId ) {
	if ( isArray( productId ) ) {
		return uniq( [ ...value, ...productId ] );
	}
	return [ ...value, productId ];
}

export function removeProductId( value = [], productId ) {
	if ( isArray( productId ) ) {
		return difference( value, productId );
	}
	return value.filter( id => id !== productId );
}
