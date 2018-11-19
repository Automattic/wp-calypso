/** @format */

/**
 * External dependencies
 */
import { isString, isEqualWith } from 'lodash';

/**
 * Performs a deep comparison between two values to determine if they are equivalent.
 *
 * This function will transform strings to lowercase before comparison in order
 * to ignore capitalisation. This way `Street` and `STREET` are considered equal.
 *
 * All other data types will be treated the same way as in `isEqual`.
 *
 * @param   {*} value The value/object/array to to.
 * @param   {*} other The value/object/array to with.
 * @returns {boolean} An indicator whether both values are deeply equal.
 */
export default function isEqualCaseInsensitive( value, other ) {
	return isEqualWith( value, other, ( left, right ) => {
		if ( isString( left ) && isString( right ) ) {
			return left.toLowerCase() === right.toLowerCase();
		}
	} );
}
