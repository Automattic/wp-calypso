import decode from './decode';

export function decodeEntities( text: string ) {
	// Bypass decode if text doesn't include entities
	if ( 'string' !== typeof text || -1 === text.indexOf( '&' ) ) {
		return text;
	}

	return decode( text );
}
