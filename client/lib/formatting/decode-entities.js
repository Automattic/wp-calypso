/**
 * Internal Dependencies
 */
import decode from './decode';

export function decodeEntities( text ) {
	// Bypass decode if text doesn't include entities
	if ( 'string' !== typeof text || -1 === text.indexOf( '&' ) ) {
		return text;
	}

	return decode( text );
}
