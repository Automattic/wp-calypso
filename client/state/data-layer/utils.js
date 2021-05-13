/**
 * External dependencies
 */
import { camelCase, isPlainObject, map, reduce, set, snakeCase } from 'lodash';
import { extendAction } from '@automattic/state-utils';

const doBypassDataLayer = {
	meta: {
		dataLayer: {
			doBypass: true,
		},
	},
};

export const bypassDataLayer = ( action ) => extendAction( action, doBypassDataLayer );

/**
 * Deeply converts keys of an object using provided function.
 *
 * @param {object} obj object to convert
 * @param  {Function} fn function to apply to each key of the object
 * @returns {object} a new object with all keys converted
 */
export function convertKeysBy( obj, fn ) {
	if ( Array.isArray( obj ) ) {
		return map( obj, ( v ) => convertKeysBy( v, fn ) );
	}

	if ( isPlainObject( obj ) ) {
		return reduce(
			obj,
			( result, value, key ) => {
				const newKey = fn( key );
				const newValue = convertKeysBy( value, fn );
				return set( result, [ newKey ], newValue );
			},
			{}
		);
	}

	return obj;
}

/**
 * Deeply converts keys from the specified object to camelCase notation.
 *
 * @param {object} obj object to convert
 * @returns {object} a new object with all keys converted
 */
export const convertToCamelCase = ( obj ) => convertKeysBy( obj, camelCase );

/**
 * Deeply convert keys of an object to snake_case.
 *
 * @param {object} obj Object to convert
 * @returns {object} a new object with snake_cased keys
 */
export const convertToSnakeCase = ( obj ) => convertKeysBy( obj, snakeCase );
