/**
 * Internal dependencies
 */
import { getLocaleSlug } from 'i18n-calypso';

import {
	localesWithBlog,
	localesWithPrivacyPolicy,
	localesWithCookiePolicy,
	localesToSubdomains,
	supportSiteLocales,
	forumLocales,
	magnificentNonEnLocales,
	jetpackComLocales,
	Locale,
} from './locales';

const INVALID_URL = `http://__domain__.invalid`;

const setLocalizedUrlHost = ( hostname: string, validLocales: Locale[] = [] ) => (
	url: URL,
	locale: Locale
) => {
	if ( validLocales.includes( locale ) && locale !== 'en' ) {
		// Avoid changing the hostname when the locale is set via the path.
		if ( url.pathname.substr( 0, locale.length + 2 ) !== '/' + locale + '/' ) {
			url.host = `${ localesToSubdomains[ locale ] || locale }.${ hostname }`;
		}
	}
	return url;
};

const setLocalizedWpComPath = (
	prefix: string,
	validLocales: Locale[] = [],
	limitPathMatch: RegExp | null = null
) => ( url: URL, localeSlug: Locale ) => {
	url.host = 'wordpress.com';
	if (
		typeof limitPathMatch === 'object' &&
		limitPathMatch instanceof RegExp &&
		! limitPathMatch.test( url.pathname )
	) {
		validLocales = []; // only rewrite to English.
	}
	url.pathname = prefix + url.pathname;

	if ( validLocales.includes( localeSlug ) && localeSlug !== 'en' ) {
		url.pathname = ( localesToSubdomains[ localeSlug ] || localeSlug ) + url.pathname;
	}
	return url;
};

const prefixLocalizedUrlPath = (
	validLocales: Locale[] = [],
	limitPathMatch: RegExp | null = null
) => ( url: URL, localeSlug: Locale ): URL => {
	if ( typeof limitPathMatch === 'object' && limitPathMatch instanceof RegExp ) {
		if ( ! limitPathMatch.test( url.pathname ) ) {
			return url; // No rewriting if not matches the path.
		}
	}

	if ( validLocales.includes( localeSlug ) && localeSlug !== 'en' ) {
		url.pathname = ( localesToSubdomains[ localeSlug ] || localeSlug ) + url.pathname;
	}
	return url;
};

type LinkLocalizer = ( url: URL, localeSlug: string ) => URL;

interface UrlLocalizationMapping {
	[ key: string ]: LinkLocalizer;
}

const urlLocalizationMapping: UrlLocalizationMapping = {
	'wordpress.com/support/': prefixLocalizedUrlPath( supportSiteLocales ),
	'wordpress.com/blog/': prefixLocalizedUrlPath( localesWithBlog, /^\/blog\/?$/ ),
	'wordpress.com/tos/': setLocalizedUrlHost( 'wordpress.com', magnificentNonEnLocales ),
	'jetpack.com': setLocalizedUrlHost( 'jetpack.com', jetpackComLocales ),
	'en.support.wordpress.com': setLocalizedWpComPath( '/support', supportSiteLocales ),
	'en.blog.wordpress.com': setLocalizedWpComPath( '/blog', localesWithBlog, /^\/$/ ),
	'en.forums.wordpress.com': setLocalizedUrlHost( 'forums.wordpress.com', forumLocales ),
	'automattic.com/privacy/': prefixLocalizedUrlPath( localesWithPrivacyPolicy ),
	'automattic.com/cookies/': prefixLocalizedUrlPath( localesWithCookiePolicy ),
	'wordpress.com': setLocalizedUrlHost( 'wordpress.com', magnificentNonEnLocales ),
};

export function localizeUrl( fullUrl: string, toLocale?: Locale ): string {
	const locale =
		toLocale || ( typeof getLocaleSlug === 'function' ? getLocaleSlug() || 'en' : 'en' );

	const url = new URL( String( fullUrl ), INVALID_URL );

	// Ignore and passthrough /relative/urls that have no host specified
	if ( url.origin === INVALID_URL ) {
		return fullUrl;
	}

	// Let's unify the URL.
	url.protocol = 'https:';
	// Let's use `host` for everything.
	url.hostname = '';

	if ( ! url.pathname.endsWith( '.php' ) ) {
		url.pathname = ( url.pathname + '/' ).replace( /\/+$/, '/' );
	}

	if ( ! locale || 'en' === locale ) {
		if ( 'en.wordpress.com' === url.host ) {
			url.host = 'wordpress.com';
			return url.href;
		}
	}

	if ( 'en.wordpress.com' === url.host ) {
		url.host = 'wordpress.com';
	}

	const lookup = [
		url.host,
		url.host + url.pathname,
		url.host + url.pathname.substr( 0, 1 + url.pathname.indexOf( '/', 1 ) ),
	];

	for ( let i = lookup.length - 1; i >= 0; i-- ) {
		if ( lookup[ i ] in urlLocalizationMapping ) {
			return urlLocalizationMapping[ lookup[ i ] ]( url, locale ).href;
		}
	}

	// Nothing needed to be changed, just return it unmodified.
	return fullUrl;
}
