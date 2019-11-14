/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * Returns a formatted variation name for display based on attributes.
 *
 *
 * @param {Object} variant the product variant option which includes the attributes key.
 * @param {String} fallbackName Fallback name to use if no attributes are passed.
 * @return {String} Formatted variation name.
 */

export default function formattedVariationName( { attributes }, fallbackName = '' ) {
	return map( attributes, 'option' ).join( ' - ' ) || fallbackName;
}
