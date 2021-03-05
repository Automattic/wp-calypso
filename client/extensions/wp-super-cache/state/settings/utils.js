/**
 * External dependencies
 */

import { mapValues } from 'lodash';

/**
 * Normalize settings for use in Redux.
 *
 * @param  {object} settings Raw settings
 * @returns {object} Normalized settings
 */
export const normalizeSettings = ( settings ) => {
	return mapValues( settings, ( setting, key ) => {
		switch ( key ) {
			case 'cache_acceptable_files':
			case 'cache_rejected_uri':
			case 'cache_rejected_user_agent':
				return setting.join( '\n' );
			default:
				return setting;
		}
	} );
};

/**
 * Sanitize settings before saving.
 *
 * @param  {object} settings Normalized settings
 * @returns {object} Sanitized settings
 */
export const sanitizeSettings = ( settings ) => {
	return mapValues( settings, ( setting, key ) => {
		switch ( key ) {
			case 'cache_acceptable_files':
			case 'cache_rejected_uri':
			case 'cache_rejected_user_agent':
				return setting.split( '\n' );
			// Don't include read-only fields when saving.
			case 'cache_mobile_browsers':
			case 'cache_mobile_prefixes':
			case 'cache_mod_rewrite':
			case 'cache_next_gc':
			case 'default_cache_path':
			case 'is_preloading':
			case 'minimum_preload_interval':
			case 'post_count':
			case 'preload_refresh':
				return undefined;
			default:
				return setting;
		}
	} );
};
