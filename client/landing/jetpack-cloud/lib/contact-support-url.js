/**
 * Internal dependencies
 */
import { JETPACK_CONTACT_SUPPORT } from 'lib/url/support';

/**
 * Creates a URL that refers to the Jetpack 'Contact Support' page,
 * with accompanying useful information about the reason for the
 * support request.
 *
 * @param {string} [siteUrl]	A site URL
 * @param {string} [scanState]	The current state of Jetpack Scan/Backup
 * @returns {string} 			The support request URL
 */
export default function contactSupportUrl( siteUrl, scanState ) {
	// NOTE: This is an extremely simple, early implementation;
	// if we add more options in the future, we'll want
	// to come back and change how we build this query string
	const params = [];
	if ( siteUrl ) {
		params.push( `url=${ siteUrl }` );
	}

	if ( scanState ) {
		params.push( `scan-state=${ scanState }` );
	}

	// At present, JETPACK_CONTACT_SUPPORT already contains an initial query string
	// parameter, so we can safely append all our parameters using '&'
	return [ JETPACK_CONTACT_SUPPORT, ...params ].join( '&' );
}
