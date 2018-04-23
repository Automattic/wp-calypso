/** @format */

/**
 * External dependencies
 */
import { camelCase, isArray, isObjectLike, isPlainObject, map, reduce, set } from 'lodash';

/**
 * Internal dependencies
 */
import { extendAction } from 'state/utils';

const doBypassDataLayer = {
	meta: {
		dataLayer: {
			doBypass: true,
		},
	},
};

export const bypassDataLayer = action => extendAction( action, doBypassDataLayer );

/**
 * Deeply converts keys from the specified object to camelCase notation.
 *
 * @param {Object} obj object to convert
 * @returns {Object}   a new object with all keys converted
 */
export function convertToCamelCase( obj ) {
	if ( isArray( obj ) ) {
		return map( obj, convertToCamelCase );
	}

	if ( isPlainObject( obj ) ) {
		return reduce(
			obj,
			( result, value, key ) => {
				const newKey = camelCase( key );
				const newValue = isObjectLike( value ) ? convertToCamelCase( value ) : value;
				return set( result, [ newKey ], newValue );
			},
			{}
		);
	}

	return obj;
}
