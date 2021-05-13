/**
 * External dependencies
 */
import { isPlainObject } from 'lodash';

/**
 * Normalize API Settings
 *
 * @param {object} settings Raw API settings
 * @returns {object}          Normalized settings
 */

export function normalizeSettings( settings ) {
	return Object.keys( settings ).reduce( ( memo, key ) => {
		switch ( key ) {
			case 'default_category':
				memo[ key ] = parseInt( settings[ key ] );
				break;
			case 'sharing_show':
				if ( isPlainObject( settings[ key ] ) ) {
					memo[ key ] = Object.values( settings[ key ] );
				} else {
					memo[ key ] = settings[ key ];
				}
				break;
			default:
				memo[ key ] = settings[ key ];
		}

		return memo;
	}, {} );
}
