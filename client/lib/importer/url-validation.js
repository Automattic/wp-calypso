import { translate } from 'i18n-calypso';
import { trim } from 'lodash';

export const parseUrl = function ( value = '' ) {
	const rawUrl = trim( value );
	const hasProtocol = value.startsWith( 'https://' ) || value.startsWith( 'http://' );

	return new URL( hasProtocol ? rawUrl : 'https://' + rawUrl );
};

export const hasTld = function ( hostname ) {
	// Min length of hostname with TLD is 4 characters, e.g. "a.co".
	const lastDotIndex = hostname.lastIndexOf( '.' );
	return hostname.length > 3 && lastDotIndex >= 1 && lastDotIndex < hostname.length - 2;
};

export function validateImportUrl( value ) {
	if ( ! isValidUrl( value ) ) {
		return translate( 'Please enter a valid URL.' );
	}

	const { hostname, pathname } = parseUrl( value );

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

export function isValidUrl( value ) {
	let parsedUrl;
	try {
		parsedUrl = parseUrl( value );
	} catch ( error ) {
		return false;
	}

	// `isURL` considers `http://a` valid, so check for a top level domain name as well.
	if ( ! parsedUrl || ! hasTld( parsedUrl.hostname ) ) {
		return false;
	}

	return true;
}
