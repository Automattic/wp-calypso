/**
 * External dependencies
 */
const { URL } = require( 'url' );
const { shell } = require( 'electron' );

/**
 * Internal dependencies
 */
const log = require( 'calypso/desktop/lib/logger' )( 'desktop:external-links' );

function isValidBrowserUrl( url ) {
	const parsedUrl = new URL( url );

	if ( parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:' ) {
		return url;
	}

	return false;
}

module.exports = function ( event, url ) {
	if ( isValidBrowserUrl( url ) ) {
		log.info( `Using system default handler for URL: ${ url }` );
		shell.openExternal( url );
	}

	if ( event ) {
		event.preventDefault();
	}
};
