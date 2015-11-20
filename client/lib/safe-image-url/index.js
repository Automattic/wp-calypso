/**
 * External Dependencies
 */
var photon = require( 'photon' ),
	uri = require( 'url' );

/**
 * Internal Dependencies
 */

/**
 * Generate a safe version of the provided URL
 *
 * Images that Calypso uses have to be provided by
 * a trusted TLS host. To do this, we check the host
 * of the URL against a whitelist, and run the image
 * through photon if the host name does not match.
 *
 * We special case gravatar, because we control them.
 *
 * @param  {string} url The URL to secure
 * @return {string}     The secured URL
 */
function safeImageURL( url ) {
	if ( typeof url !== 'string' ) {
		return null;
	}

	// if it's relative, return it
	if ( /^\/[^/]/.test( url ) ) {
		return url;
	}

	const parsed = uri.parse( url, false, true );

	if ( /^([-a-zA-Z0-9_]+\.)*(gravatar.com|wordpress.com|wp.com|a8c.com)$/.test( parsed.hostname ) ) {
		// wp-hosted domains can be safely promoted to ssl
		return url.replace( /^http:/, 'https:' );
	}

	// Photon doesn't support query strings
	if ( parsed.query ) {
		delete parsed.search;
		delete parsed.query;
		url = uri.format( parsed );
	}
	// run it through photon, even if it had a querystring we couldn't strip
	return photon( url );
}

module.exports = safeImageURL;
