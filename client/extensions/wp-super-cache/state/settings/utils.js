/**
 * Normalize settings for use in Redux.
 *
 * @param  {Object} settings Raw settings
 * @return {Object} Normalized settings
 */
export const normalizeSettings = settings => {
	return Object.keys( settings ).reduce( ( acc, key ) => {
		switch ( key ) {
			case 'cache_acceptable_files':
			case 'cache_rejected_uri':
			case 'cache_rejected_user_agent':
				acc[ key ] = settings[ key ].join( '\n' );
				break;
			default:
				acc[ key ] = settings[ key ];
		}

		return acc;
	}, {} );
};

/**
 * Sanitize settings before saving.
 *
 * @param  {Object} settings Normalized settings
 * @return {Object} Sanitized settings
 */
export const sanitizeSettings = settings => {
	return Object.keys( settings ).reduce( ( acc, key ) => {
		switch ( key ) {
			case 'cache_acceptable_files':
			case 'cache_rejected_uri':
			case 'cache_rejected_user_agent':
				acc[ key ] = settings[ key ].split( '\n' );
				break;
			default:
				acc[ key ] = settings[ key ];
		}

		return acc;
	}, {} );
};
