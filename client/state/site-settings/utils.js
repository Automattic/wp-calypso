/**
 * Normalize API Settings
 *
 * @param {Object} settings Raw API settings
 * @returns {Object}          Normalized settings
 */

export function normalizeSettings( settings ) {
	return Object.keys( settings ).reduce( ( memo, key ) => {
		switch ( key ) {
			case 'default_category':
				memo[ key ] = parseInt( settings[ key ] );
				break;
			case 'sharing_show':
				if ( typeof settings[ key ] === 'object' && settings[ key ] !== null ) {
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
