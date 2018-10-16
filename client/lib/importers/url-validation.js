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
			"You've entered a URL for the Wix editor. Please enter your site's public URL. See examples below."
		);
	} else if ( hostname.indexOf( '.wixsite.com' ) > -1 && pathname === '/' ) {
		return translate(
			'Please enter the full URL and include the part that comes after wixsite.com. See example below.'
		);
	}

	return null;
}
