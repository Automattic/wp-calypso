/** @ssr-ready **/

/**
 * External Dependencies
 */
const photon = require( 'photon' );
const url = require( 'url' );

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
 * @param  {string} imageUrl The URL to secure
 * @return {string}     The secured URL, or null if we couldn't make it safe
 */
function safeImageURL( imageUrl ) {
	if ( typeof imageUrl !== 'string' ) {
		return null;
	}

	// if it's relative, return it
	if ( /^\/[^/]/.test( imageUrl ) ) {
		return imageUrl;
	}

	const parsed = url.parse( imageUrl, false, true );

	if ( /^([-a-zA-Z0-9_]+\.)*(gravatar.com|wordpress.com|wp.com|a8c.com)$/.test( parsed.hostname ) ) {
		// wp-hosted domains can be safely promoted to ssl
		return imageUrl.replace( /^http:/, 'https:' );
	}

	// we cannot make any external url with a querystring safe, so strip it
	parsed.search = null;
	parsed.query = null;

	return photon( url.format( parsed ) );
}

module.exports = safeImageURL;
