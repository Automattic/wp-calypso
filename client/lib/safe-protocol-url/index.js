/**
 * External Dependencies
 */
var urls = require( 'url' ),
	assign = require( 'lodash/assign' ),
	pick = require( 'lodash/pick' );

module.exports = function( url ) {
	var bits,
		formatKeys = [
			'host',
			'hash',
			'search',
			'path'
		];

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

	return urls.format(
		assign(
			pick( bits, formatKeys ),
			{ protocol: 'http' }
		)
	);
};
