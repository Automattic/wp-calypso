/** @format */

/**
 * External dependencies
 */
import url from 'url';
import { isWebUri } from 'valid-url';
import { translate } from 'i18n-calypso';
import { inRange, trim } from 'lodash';

const parseUrl = function( value = '' ) {
	const parsedUrl = url.parse( value, false, true );

	// Ensure parsed url has host/hostname by prefixing with protocol, if needed.
	return parsedUrl.protocol ? parsedUrl : url.parse( 'https://' + value );
};

const isValidUrl = function( parsedUrl ) {
	const { hostname } = parsedUrl;

	// `isWebUri` considers `http://a` valid, so check for a top level domain name as well.
	// Min length of hostname with TLD is 4 characters.
	const hasTld =
		hostname.length > 3 && inRange( hostname.lastIndexOf( '.' ), 1, hostname.length - 2 );

	return isWebUri( url.format( parsedUrl ) ) && hasTld;
};

export function validateImportUrl( value ) {
	const parsedUrl = parseUrl( trim( value ) );
	const { hostname, pathname } = parsedUrl;
	const siteUrl = url.format( parsedUrl );

	if ( ! siteUrl || ! isValidUrl( parsedUrl ) ) {
		return translate( 'Please enter a valid URL.' );
	} else if ( hostname === 'editor.wix.com' || hostname === 'www.wix.com' ) {
		return translate(
			"You've entered the URL for the Wix editor, which only you can access. Please enter your site's public URL. It should look like one of the examples below."
		);
	} else if ( hostname.indexOf( '.wixsite.com' ) > -1 && pathname === '/' ) {
		return translate(
			"You haven't entered the full URL. Please include the part of the URL that comes after wixsite.com. See below for an example."
		);
	}

	return null;
}
