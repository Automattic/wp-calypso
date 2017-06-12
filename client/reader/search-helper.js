/**
 * External Dependencies
 */
import querystring from 'querystring';

let algorithm;

// try to pick the default algorithm up from the querystring
if ( typeof window !== 'undefined' && window.location.search ) {
	const query = querystring.parse( window.location.search.substring( 1 ) );
	if ( query.algorithm ) {
		algorithm = query.algorithm;
	}
}

export default function getDefaultSearchAlgorithm() {
	return algorithm;
}
