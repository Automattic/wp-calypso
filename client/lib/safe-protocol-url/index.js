/**
 * External dependencies
 */

import { assign, pick } from 'lodash';
import urls from 'url';

export default function( url ) {
	let bits,
		formatKeys = [ 'host', 'hash', 'search', 'path' ];

	// If it's empty, return null
	if ( null === url || '' === url || 'undefined' === typeof url ) {
		return null;
	}

	bits = urls.parse( url );

	// If it's relative, return it
	if ( /^\/[^/]/.test( url ) ) {
		return url;
	}

	if ( 'http:' === bits.protocol || 'https:' === bits.protocol ) {
		return url;
	}

	return urls.format( assign( pick( bits, formatKeys ), { protocol: 'http' } ) );
}
