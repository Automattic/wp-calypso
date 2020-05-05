/**
 * External dependencies
 */
import url from 'url';
import { isURL } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { inRange, trim } from 'lodash';

const parseUrl = function ( value = '' ) {
	const rawUrl = trim( value );
	const parsedUrl = url.parse( rawUrl, false, true );

	// `url.parse` will only parse the host/hostname if protocol is included.
	return parsedUrl.protocol ? parsedUrl : url.parse( 'https://' + rawUrl );
};

const hasTld = function ( hostname ) {
	// Min length of hostname with TLD is 4 characters, e.g. "a.co".
	return hostname.length > 3 && inRange( hostname.lastIndexOf( '.' ), 1, hostname.length - 2 );
};

export function validateImportUrl( value ) {
	let parsedUrl, formattedUrl;
	try {
		parsedUrl = parseUrl( value );
		formattedUrl = url.format( parsedUrl );
	} catch ( error ) {
		return translate( 'Please enter a valid URL.' );
	}

	const { hostname, pathname } = parsedUrl;

	// `isURL` considers `http://a` valid, so check for a top level domain name as well.
	if ( ! formattedUrl || ! isURL( formattedUrl ) || ! hasTld( hostname ) ) {
		return translate( 'Please enter a valid URL.' );
	}

	if ( hostname === 'editor.wix.com' || hostname === 'www.wix.com' ) {
		return translate(
			"You've entered a URL for the Wix editor. Please enter your site's public URL. See examples below."
		);
	}

	if ( hostname.indexOf( '.wixsite.com' ) > -1 && pathname === '/' ) {
		return translate(
			'Please enter the full URL and include the part that comes after %(hostname)s. See example below.',
			{
				args: {
					hostname: '"wixsite.com"',
				},
			}
		);
	}

	return null;
}
