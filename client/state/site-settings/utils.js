/** @format */
/**
 * External dependencies
 */
import { values } from 'lodash';

/**
 * Normalize API Settings
 *
 * @format
 * @param {Object} settings Raw API settings
 * @return {Object}          Normalized settings
 */

export function normalizeSettings( settings ) {
	return Object.keys( settings ).reduce( ( memo, key ) => {
		switch ( key ) {
			case 'default_category':
				memo[ key ] = parseInt( settings[ key ] );
				break;
			case 'sharing_show':
				if ( typeof settings[ key ] === 'object' ) {
					memo[ key ] = values( settings[ key ] );
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
