/**
 * WordPress dependencies
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Returns the URL of a WPAdmin Page.
 *
 * TODO: This should be moved to a module less specific to the editor.
 *
 * @param {string} page  Page to navigate to.
 * @param {Object} query Query Args.
 *
 * @return {string} WPAdmin URL.
 */
export function getWPAdminURL( page, query ) {
	return addQueryArgs( page, query );
}

/**
 * Returns a URL for display.
 *
 * @param {string} url Original URL.
 *
 * @return {string} Displayed URL.
 */
export function filterURLForDisplay( url ) {
	// remove protocol and www prefixes
	const filteredURL = url.replace( new RegExp( '^https?://(www\.)?' ), '' );

	// ends with / and only has that single slash, strip it
	if ( filteredURL.match( '^[^/]+/$' ) ) {
		return filteredURL.replace( '/', '' );
	}

	return filteredURL;
}
