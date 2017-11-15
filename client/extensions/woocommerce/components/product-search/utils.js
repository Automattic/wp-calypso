/** @format */

/**
 * External dependencies
 */
import { difference, filter, intersection, isArray, uniq } from 'lodash';

/**
 * Check if a string is found in a product name or attribute option
 *
 * @param {Object} product A given product to search
 * @param {String} textString A string to search for
 * @return {Boolean} Whether the string was found in the product
 */
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

/**
 * Check if a string is found in a product name or attribute option
 *
 * @param {Array} value An array of existing values
 * @param {Number} productId The product ID to search for
 * @return {Boolean} Whether the product ID exists in the list of values
 */
export function isProductSelected( value = [], productId ) {
	if ( isArray( value ) && value.length ) {
		return -1 !== value.indexOf( productId );
	}
	return value === productId;
}

/**
 * Check if any variations of a product are selected
 *
 * @param {Array} value An array of existing values
 * @param {Object} product The product to check
 * @return {Boolean} Whether any variations exist in the values list
 */
export function areVariationsSelected( value = [], product ) {
	const variations = product.variations;
	if ( ! variations.length ) {
		return false;
	}
	if ( isArray( value ) && value.length ) {
		return !! intersection( value, variations ).length;
	}
	return -1 !== variations.indexOf( value );
}

/**
 * Check if a product is `variable` (has selectable variations)
 *
 * @param {Object} product A product to check
 * @return {Boolean} Whether the product has variations
 */
export function isVariableProduct( product ) {
	return 'variable' === product.type && ! product.isVariation;
}

/**
 * Add a product ID (or list of IDs) to a list of values
 *
 * @param {Array} value An array of existing values
 * @param {Number|Array} productId The product ID(s) to add
 * @return {Array} Updated list of values
 */
export function addProductId( value = [], productId ) {
	if ( isArray( productId ) ) {
		return uniq( [ ...value, ...productId ] );
	}
	return uniq( [ ...value, productId ] );
}

/**
 * Remove a product ID (or list of IDs) from a list of values
 *
 * @param {Array} value An array of existing values
 * @param {Number|Array} productId The product ID(s) to remove
 * @return {Array} Updated list of values
 */
export function removeProductId( value = [], productId ) {
	if ( isArray( productId ) ) {
		return difference( value, productId );
	}
	return value.filter( id => id !== productId );
}
