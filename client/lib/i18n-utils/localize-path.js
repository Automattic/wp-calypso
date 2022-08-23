import { localizeUrl } from '@automattic/i18n-utils';
import i18n from 'i18n-calypso';

const DEFAULT_ORIGIN = 'https://wordpress.com';

function getDefaultLocale() {
	return i18n.getLocaleSlug?.() ?? 'en';
}

export function localizePath( path, locale = getDefaultLocale(), isLoggedIn ) {
	let url;

	if ( typeof path !== 'string' ) {
		return path;
	}

	try {
		// Assume all relative paths passed in resolve to a calypso url.
		url = new URL( String( path ), DEFAULT_ORIGIN );
	} catch ( e ) {
		return path;
	}

	url = localizeUrl( url.toString(), locale, isLoggedIn, true );

	return url.toString().replace( new RegExp( DEFAULT_ORIGIN ), '' );
}
