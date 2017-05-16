/**
 * External dependencies
 */
import { mapValues } from 'lodash';

/**
 * Normalize settings for use in Redux.
 *
 * @param  {Object} settings Raw settings
 * @return {Object} Normalized settings
 */
export const normalizeSettings = settings => {
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
 * @param  {Object} settings Normalized settings
 * @return {Object} Sanitized settings
 */
export const sanitizeSettings = settings => {
	return mapValues( settings, ( setting, key ) => {
		switch ( key ) {
			case 'cache_acceptable_files':
			case 'cache_rejected_uri':
			case 'cache_rejected_user_agent':
				return setting.split( '\n' );
			default:
				return setting;
		}
	} );
};
