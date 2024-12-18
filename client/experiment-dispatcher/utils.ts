import config from '@automattic/calypso-config';
import { experimentsCatalog } from './experiments';

/**
 * Injects the locale slug with considering the existing query parameters.
 * @param url the url
 * @param locale the locale
 * @returns /path/locale?query=parameters
 */
function addLocaleSegment( url: string, locale: string ) {
	if ( ! locale ) {
		return url;
	}
	const fullUrl = new URL( url, window.location.href );
	const segments = fullUrl.pathname.split( '/' );
	segments.push( locale );
	fullUrl.pathname = segments.join( '/' );
	return fullUrl.href;
}

/**
 * Redirect to a URL but conserves the existing query parameters.
 * @param target a URL to redirect to.
 */
export function redirectWithParamsAndLocale( target: string ) {
	const locale = getLocaleFromUrl();
	const url = new URL( window.location.href );
	const targetWithLocale = addLocaleSegment( target, locale );

	const params = url.searchParams.toString();
	if ( params ) {
		window.location.replace( `${ targetWithLocale }?${ params }` );
	} else {
		window.location.replace( targetWithLocale );
	}
}

/**
 * Gets the experiment manifest by determining its slug from the URL then retrieving it from the catalog.
 */
export function getManifestFromUrl() {
	const slug = window.location.pathname.split( '/' )[ 2 ] as keyof typeof experimentsCatalog;
	const experiment = slug in experimentsCatalog && experimentsCatalog[ slug ];
	if ( ! experiment ) {
		throw new Error( `Experiment with slug ${ slug } not found` );
	}
	return experiment;
}

/**
 * Gets the locale from the URL.
 */
export function getLocaleFromUrl() {
	const allowedLocales = config( 'magnificent_non_en_locales' ) as string[];
	const locale = window.location.pathname.split( '/' )[ 3 ] || '';
	if ( allowedLocales.includes( locale ) ) {
		return locale;
	}
	return '';
}
