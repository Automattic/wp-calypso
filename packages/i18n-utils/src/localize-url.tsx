import { createHigherOrderComponent } from '@wordpress/compose';
import { useCallback, ComponentType } from 'react';
import { useLocale, getWpI18nLocaleSlug } from './locale-context';
import {
	localesWithBlog,
	localesWithGoBlog,
	localesWithPrivacyPolicy,
	localesWithCookiePolicy,
	localesToSubdomains,
	localesWithLearn,
	supportSiteLocales,
	forumLocales,
	magnificentNonEnLocales,
	localesForPricePlans,
	jetpackComLocales,
	wpLoginLocales,
	Locale,
} from './locales';

const INVALID_URL = `http://__domain__.invalid`;

function getDefaultLocale(): Locale {
	return getWpI18nLocaleSlug() ?? 'en';
}

const setLocalizedUrlHost =
	( hostname: string, validLocales: Locale[] = [] ) =>
	( url: URL, locale: Locale ) => {
		if ( validLocales.includes( locale ) && locale !== 'en' ) {
			// Avoid changing the hostname when the locale is set via the path.
			if ( url.pathname.substr( 0, locale.length + 2 ) !== '/' + locale + '/' ) {
				url.host = `${ localesToSubdomains[ locale ] || locale }.${ hostname }`;
			}
		}
		return url;
	};

const setLocalizedWpComPath =
	( prefix: string, validLocales: Locale[] = [], limitPathMatch: RegExp | null = null ) =>
	( url: URL, localeSlug: Locale ) => {
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
			url.pathname = localeSlug + url.pathname;
		}
		return url;
	};

type PrefixOrSuffix = 'prefix' | 'suffix';

const prefixOrSuffixLocalizedUrlPath =
	(
		validLocales: Locale[] = [],
		limitPathMatch: RegExp | null = null,
		prefixOrSuffix: PrefixOrSuffix
	) =>
	( url: URL, localeSlug: Locale ): URL => {
		if ( typeof limitPathMatch === 'object' && limitPathMatch instanceof RegExp ) {
			if ( ! limitPathMatch.test( url.pathname ) ) {
				return url; // No rewriting if not matches the path.
			}
		}

		if ( ! validLocales.includes( localeSlug ) || localeSlug === 'en' ) {
			return url;
		}

		if ( prefixOrSuffix === 'prefix' ) {
			url.pathname = localeSlug + url.pathname;
		} else if ( prefixOrSuffix === 'suffix' ) {
			// Make sure there's a slash between the path and the locale. Plus, if
			// the path has a trailing slash, add one after the suffix too.
			if ( url.pathname.endsWith( '/' ) ) {
				url.pathname += localeSlug + '/';
			} else {
				url.pathname += '/' + localeSlug;
			}
		}
		return url;
	};

const prefixLocalizedUrlPath =
	( validLocales: Locale[] = [], limitPathMatch: RegExp | null = null ) =>
	( url: URL, localeSlug: Locale ): URL => {
		return prefixOrSuffixLocalizedUrlPath(
			validLocales,
			limitPathMatch,
			'prefix'
		)( url, localeSlug );
	};

const suffixLocalizedUrlPath =
	( validLocales: Locale[] = [], limitPathMatch: RegExp | null = null ) =>
	( url: URL, localeSlug: Locale ): URL => {
		return prefixOrSuffixLocalizedUrlPath(
			validLocales,
			limitPathMatch,
			'suffix'
		)( url, localeSlug );
	};

type LinkLocalizer = ( url: URL, localeSlug: string, isLoggedIn: boolean ) => URL;

interface UrlLocalizationMapping {
	[ key: string ]: LinkLocalizer;
}

export const urlLocalizationMapping: UrlLocalizationMapping = {
	'wordpress.com/support/': prefixLocalizedUrlPath( supportSiteLocales ),
	'wordpress.com/forums/': prefixLocalizedUrlPath( forumLocales ),
	'wordpress.com/blog/': prefixLocalizedUrlPath( localesWithBlog, /^\/blog\/?$/ ),
	'wordpress.com/go/': ( url: URL, localeSlug: Locale ): URL => {
		// Rewrite non-home URLs (e.g. posts) only for Spanish, because that's
		// the only language into which we're currently translating content.
		const isHome = [ '/go/', '/go' ].includes( url.pathname );
		if ( ! isHome && 'es' !== localeSlug ) {
			return url;
		}
		return prefixLocalizedUrlPath( localesWithGoBlog )( url, localeSlug );
	},
	'wordpress.com/pricing/': prefixLocalizedUrlPath( localesForPricePlans ),
	'wordpress.com/tos/': prefixLocalizedUrlPath( magnificentNonEnLocales ),
	'wordpress.com/wp-admin/': setLocalizedUrlHost( 'wordpress.com', magnificentNonEnLocales ),
	'wordpress.com/wp-login.php': setLocalizedUrlHost( 'wordpress.com', wpLoginLocales ),
	'jetpack.com': prefixLocalizedUrlPath( jetpackComLocales ),
	'cloud.jetpack.com': prefixLocalizedUrlPath( jetpackComLocales ),
	'en.support.wordpress.com': setLocalizedWpComPath( '/support', supportSiteLocales ),
	'en.blog.wordpress.com': setLocalizedWpComPath( '/blog', localesWithBlog, /^\/$/ ),
	'apps.wordpress.com': prefixLocalizedUrlPath( magnificentNonEnLocales ),
	'en.forums.wordpress.com': setLocalizedWpComPath( '/forums', forumLocales ),
	'automattic.com/privacy/': prefixLocalizedUrlPath( localesWithPrivacyPolicy ),
	'automattic.com/cookies/': prefixLocalizedUrlPath( localesWithCookiePolicy ),
	'wordpress.com/help/contact/': ( url: URL, localeSlug: Locale, isLoggedIn: boolean ) => {
		if ( isLoggedIn ) {
			return url;
		}
		url.pathname = url.pathname.replace( /\/help\//, '/support/' );
		return prefixLocalizedUrlPath( supportSiteLocales )( url, localeSlug );
	},
	'wordpress.com': ( url: URL, localeSlug: Locale ) => {
		// Don't rewrite checkout and me URLs.
		if ( /^\/(checkout|me)(\/|$)/.test( url.pathname ) ) {
			return url;
		}
		// Don't rewrite Calypso URLs that have the URL at the end.
		if ( /\/([a-z0-9-]+\.)+[a-z]{2,}\/?$/.test( url.pathname ) ) {
			return url;
		}
		return prefixLocalizedUrlPath( magnificentNonEnLocales )( url, localeSlug );
	},
	'wordpress.com/theme/': ( url: URL, localeSlug: Locale, isLoggedIn: boolean ) => {
		return isLoggedIn ? url : prefixLocalizedUrlPath( magnificentNonEnLocales )( url, localeSlug );
	},
	'wordpress.com/themes/': ( url: URL, localeSlug: Locale, isLoggedIn: boolean ) => {
		return isLoggedIn ? url : prefixLocalizedUrlPath( magnificentNonEnLocales )( url, localeSlug );
	},
	'wordpress.com/plugins/': ( url: URL, localeSlug: Locale, isLoggedIn: boolean ) => {
		return isLoggedIn ? url : prefixLocalizedUrlPath( magnificentNonEnLocales )( url, localeSlug );
	},
	'wordpress.com/log-in/': ( url: URL, localeSlug: Locale, isLoggedIn: boolean ) => {
		return isLoggedIn ? url : suffixLocalizedUrlPath( magnificentNonEnLocales )( url, localeSlug );
	},
	'wordpress.com/start/': ( url: URL, localeSlug: Locale, isLoggedIn: boolean ) => {
		return isLoggedIn ? url : suffixLocalizedUrlPath( magnificentNonEnLocales )( url, localeSlug );
	},
	'wordpress.com/learn/': ( url: URL, localeSlug: Locale ) => {
		const webinars = url.pathname.includes( '/learn/webinars/' );
		if ( webinars && 'es' === localeSlug ) {
			url.pathname = url.pathname.replace( '/learn/webinars/', '/learn/es/webinars/' );
			return url;
		}
		return suffixLocalizedUrlPath( localesWithLearn )( url, localeSlug );
	},
	'wordpress.com/plans/': ( url: URL, localeSlug: Locale, isLoggedIn: boolean ) => {
		// if logged in, or url.pathname contains characters after `/plans/`, don't rewrite
		return isLoggedIn || url.pathname !== '/plans/'
			? url
			: prefixLocalizedUrlPath( localesForPricePlans )( url, localeSlug );
	},
	'wordpress.com/setup/': ( url: URL, localeSlug: Locale, isLoggedIn: boolean ) => {
		return isLoggedIn ? url : suffixLocalizedUrlPath( magnificentNonEnLocales )( url, localeSlug );
	},
};

function hasTrailingSlash( urlString: string ) {
	try {
		const url = new URL( String( urlString ), INVALID_URL );
		return url.pathname.endsWith( '/' );
	} catch ( e ) {
		return false;
	}
}

export function localizeUrl(
	fullUrl: string,
	locale: Locale = getDefaultLocale(),
	isLoggedIn = true,
	preserveTrailingSlashVariation = false
): string {
	let url;
	try {
		url = new URL( String( fullUrl ), INVALID_URL );
	} catch ( e ) {
		return fullUrl;
	}

	// Ignore and passthrough /relative/urls that have no host specified
	if ( url.origin === INVALID_URL ) {
		return fullUrl;
	}

	// Let's unify the URL.
	url.protocol = 'https:';

	if ( ! url.pathname.endsWith( '.php' ) ) {
		// Essentially a trailingslashit.
		// We need to do this because the matching list is standardised to use
		// trailing slashes everywhere.
		// However, if the `preserveTrailingSlashVariation` option is enabled, we
		// remove the trailing slash at the end again, when appropriate.
		url.pathname = ( url.pathname + '/' ).replace( /\/+$/, '/' );
	}

	const firstPathSegment = url.pathname.substr( 0, 1 + url.pathname.indexOf( '/', 1 ) );

	if ( 'en.wordpress.com' === url.host ) {
		url.host = 'wordpress.com';
	}

	if ( '/' + locale + '/' === firstPathSegment ) {
		return fullUrl;
	}

	// Lookup is checked back to front.
	const lookup = [ url.host, url.host + firstPathSegment, url.host + url.pathname ];

	for ( let i = lookup.length - 1; i >= 0; i-- ) {
		if ( lookup[ i ] in urlLocalizationMapping ) {
			const mapped = urlLocalizationMapping[ lookup[ i ] ]( url, locale, isLoggedIn ).href;

			if ( ! preserveTrailingSlashVariation ) {
				return mapped;
			}

			try {
				const mappedUrl = new URL( mapped );
				if ( ! hasTrailingSlash( fullUrl ) ) {
					mappedUrl.pathname = mappedUrl.pathname.replace( /\/+$/, '' );
				}
				return mappedUrl.href;
			} catch {
				return mapped;
			}
		}
	}

	// Nothing needed to be changed, just return it unmodified.
	return fullUrl;
}

export function useLocalizeUrl() {
	const providerLocale = useLocale();

	return useCallback(
		(
			fullUrl: string,
			locale?: Locale,
			isLoggedIn?: boolean,
			preserveTrailingSlashVariation?: boolean
		) => {
			if ( locale ) {
				return localizeUrl( fullUrl, locale, isLoggedIn, preserveTrailingSlashVariation );
			}
			return localizeUrl( fullUrl, providerLocale, isLoggedIn, preserveTrailingSlashVariation );
		},
		[ providerLocale ]
	);
}

export const withLocalizeUrl = createHigherOrderComponent(
	< OuterProps, >(
		InnerComponent: ComponentType<
			OuterProps & { localizeUrl: ReturnType< typeof useLocalizeUrl > }
		>
	) => {
		return ( props: OuterProps ) => {
			const localizeUrl = useLocalizeUrl();
			const innerProps = { ...props, localizeUrl };
			return <InnerComponent { ...innerProps } />;
		};
	},
	'withLocalizeUrl'
);
