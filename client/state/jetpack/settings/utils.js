/**
 * Normalize settings for use in Redux.
 *
 * @param  {Object}   settings   Raw settings.
 * @return {Object}              Normalized settings.
 */
export const normalizeSettings = ( settings ) => {
	return Object.keys( settings ).reduce( ( memo, key ) => {
		switch ( key ) {
			case 'wp_mobile_excerpt':
			case 'wp_mobile_featured_images':
				memo[ key ] = settings[ key ] === 'enabled';
				break;
			default:
				memo[ key ] = settings[ key ];
		}

		return memo;
	}, {} );
};

/**
 * Sanitize settings for updating in the Jetpack site.
 *
 * @param  {Object}   settings   Settings.
 * @return {Object}              Normalized settings.
 */
export const sanitizeSettings = ( settings ) => {
	return Object.keys( settings ).reduce( ( memo, key ) => {
		switch ( key ) {
			case 'wp_mobile_excerpt':
			case 'wp_mobile_featured_images':
				memo[ key ] = !! settings [ key ] ? 'enabled' : 'disabled';
				break;
			case 'post_by_email_address':
				break;
			default:
				memo[ key ] = settings[ key ];
		}

		return memo;
	}, {} );
};
