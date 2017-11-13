/**
 * External Dependencies
 */
import querystring from 'querystring';

/**
 * Internal Dependencies
 */
import config from 'config';

let algorithm;

// try to pick the default algorithm up from the querystring
if (
	config( 'env_id' ) !== 'production' && typeof window !== 'undefined' && window.location.search
) {
	const query = querystring.parse( window.location.search.substring( 1 ) );
	if ( query.algorithm ) {
		algorithm = query.algorithm;
	}
}

export function getDefaultSearchAlgorithm() {
	return algorithm;
}
