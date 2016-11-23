/**
 * Normalize API Settings
 * @param  {Object} settings Raw API settings
 * @return {Object}          Normalized settings
 */
export function normalizeSettings( settings ) {
	return Object.keys( settings ).reduce( ( memo, key ) => {
		switch ( key ) {
			case 'default_category':
				memo[ key ] = parseInt( settings[ key ] );
				break;
			default:
				memo[ key ] = settings[ key ];
		}

		return memo;
	}, {} );
}
