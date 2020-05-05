/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * Returns a formatted variation name for display based on attributes.
 *
 *
 * @param {object} variant the product variant option which includes the attributes key.
 * @param {string} fallbackName Fallback name to use if no attributes are passed.
 * @returns {string} Formatted variation name.
 */

export default function formattedVariationName( { attributes }, fallbackName = '' ) {
	return map( attributes, 'option' ).join( ' - ' ) || fallbackName;
}
