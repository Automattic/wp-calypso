/** @format */
/**
 * External dependencies
 */
import { find, isString, map, pickBy, includes } from 'lodash';
import url from 'url';
import { getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';

/**
 * a locale can consist of three component
 * aa: language code
 * -bb: regional code
 * _cc: variant suffix
 * while the language code is mandatory, the other two are optional.
 */
const localeRegex = /^[A-Z]{2,3}(-[A-Z]{2,3})?(_[A-Z]{2,6})?$/i;

export function getPathParts( path ) {
	// Remove trailing slash then split. If there is a trailing slash,
	// then the end of the array could contain an empty string.
	return path.replace( /\/$/, '' ).split( '/' );
}

/**
 * Checks if provided locale is a default one.
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @return {boolean} true when the default locale is provided
 */
export function isDefaultLocale( locale ) {
	return locale === config( 'i18n_default_locale_slug' );
}

/**
 * Checks if provided locale has a parentLangSlug and is therefore a locale variant
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @return {boolean} true when the locale has a parentLangSlug
 */
export function isLocaleVariant( locale ) {
	if ( ! isString( locale ) ) {
		return false;
	}
	const language = getLanguage( locale );
	return !! language && isString( language.parentLangSlug );
}

/**
 * Checks against a list of locales that don't have any GP translation sets
 * A 'translation set' refers to a collection of strings to be translated see:
 * https://glotpress.blog/the-manual/translation-sets/
 * @param {string} locale - locale slug (eg: 'fr')
 * @return {boolean} true when the locale is NOT a member of the exception list
 */
export function canBeTranslated( locale ) {
	return [ 'en', 'sr_latin' ].indexOf( locale ) === -1;
}

/**
 * Return a list of all supported language slugs
 *
 * @return {Array} A list of all supported language slugs
 */
export function getLanguageSlugs() {
	return map( config( 'languages' ), 'langSlug' );
}

/**
 * Matches and returns language from config.languages based on the given localeSlug
 * @param  {String} langSlug locale slug of the language to match
 * @return {Object|undefined} An object containing the locale data or undefined.
 */
export function getLanguage( langSlug ) {
	if ( localeRegex.test( langSlug ) ) {
		// Find for the langSlug first. If we can't find it, split it and find its parent slug.
		// Please see the comment above `localeRegex` to see why we can split by - or _ and find the parent slug.
		return (
			find( config( 'languages' ), { langSlug } ) ||
			find( config( 'languages' ), { langSlug: langSlug.split( /[-_]/ )[ 0 ] } )
		);
	}

	return undefined;
}

/**
 * Assuming that locale is adding at the end of path, retrieves the locale if present.
 * @param {string} path - original path
 * @return {string|undefined} The locale slug if present or undefined
 */
export function getLocaleFromPath( path ) {
	const urlParts = url.parse( path );
	const locale = getPathParts( urlParts.pathname ).pop();

	return 'undefined' === typeof getLanguage( locale ) ? undefined : locale;
}

/**
 * Adds a locale slug to the current path.
 *
 * Will replace existing locale slug, if present.
 *
 * @param {string} path - original path
 * @param {string} locale - locale slug (eg: 'fr')
 * @returns {string} original path with new locale slug
 */
export function addLocaleToPath( path, locale ) {
	const urlParts = url.parse( path );
	const queryString = urlParts.search || '';

	return removeLocaleFromPath( urlParts.pathname ) + `/${ locale }` + queryString;
}

const localesToSubdomains = {
	'pt-br': 'br',
	br: 'bre',
	zh: 'zh-cn',
	'zh-hk': 'zh-tw',
	'zh-sg': 'zh-cn',
	kr: 'ko',
};

const magnificentNonEnLocales = [
	'es',
	'pt-br',
	'de',
	'fr',
	'he',
	'ja',
	'it',
	'nl',
	'ru',
	'tr',
	'id',
	'zh-cn',
	'zh-tw',
	'ko',
	'ar',
	'sv',
];

const localesWithBlog = [ 'en', 'ja', 'es', 'pt', 'fr', 'pt-br' ];
const localesForJetpackCom = [
	'en',
	'ar',
	'de',
	'es',
	'fr',
	'he',
	'id',
	'it',
	'ja',
	'ko',
	'nl',
	'pt-br',
	'ro',
	'ru',
	'sv',
	'tr',
	'zh-cn',
	'zh-tw',
];
const localesWithTranslatedSupport = [ 'ja', 'de', 'ru', 'pt-br', 'es' ];
const localesWithPrivacyPolicy = [ 'en', 'fr', 'de' ];
const localesWithCookiePolicy = [ 'en', 'fr', 'de' ];

const urlLocalizationMapping = {
	'wordpress.com': ( urlParts, localeSlug ) => {
		if ( magnificentNonEnLocales.includes( localeSlug ) ) {
			if ( localeSlug in localesToSubdomains ) {
				urlParts.host = localesToSubdomains[ localeSlug ] + '.wordpress.com';
			} else {
				urlParts.host = localeSlug + '.wordpress.com';
			}
		}
		return urlParts;
	},
	'jetpack.com': ( urlParts, localeSlug ) => {
		if ( localesForJetpackCom.includes( localeSlug ) ) {
			if ( localeSlug in localesToSubdomains ) {
				urlParts.host = localesToSubdomains[ localeSlug ] + '.jetpack.com';
			} else {
				urlParts.host = localeSlug + '.jetpack.com';
			}
		}
		return urlParts;
	},
	'en.support.wordpress.com': ( urlParts, localeSlug ) => {
		if ( localesWithTranslatedSupport.includes( localeSlug ) ) {
			if ( localeSlug in localesToSubdomains ) {
				urlParts.host = localesToSubdomains[ localeSlug ] + '.support.wordpress.com';
			} else {
				urlParts.host = localeSlug + '.support.wordpress.com';
			}
		}
		return urlParts;
	},
	'en.blog.wordpress.com': ( urlParts, localeSlug ) => {
		if ( localesWithBlog.includes( localeSlug ) ) {
			if ( localeSlug in localesToSubdomains ) {
				urlParts.host = localesToSubdomains[ localeSlug ] + '.blog.wordpress.com';
			} else {
				urlParts.host = localeSlug + '.blog.wordpress.com';
			}
		}
		return urlParts;
	},
	'en.forums.wordpress.com': ( urlParts, localeSlug ) => {
		if ( config( 'forum_locales' ).includes( localeSlug ) ) {
			if ( localeSlug in localesToSubdomains ) {
				urlParts.host = localesToSubdomains[ localeSlug ] + '.forums.wordpress.com';
			} else {
				urlParts.host = localeSlug + '.forums.wordpress.com';
			}
		}
		return urlParts;
	},
	'automattic.com/privacy/': ( urlParts, localeSlug ) => {
		if ( localesWithPrivacyPolicy.includes( localeSlug ) ) {
			urlParts.pathname = localeSlug + urlParts.pathname;
		}
		return urlParts;
	},
	'automattic.com/cookies/': ( urlParts, localeSlug ) => {
		if ( localesWithCookiePolicy.includes( localeSlug ) ) {
			urlParts.pathname = localeSlug + urlParts.pathname;
		}
		return urlParts;
	},
};

export function localizeUrl( fullUrl ) {
	const localeSlug = getLocaleSlug();
	// Let's trailingslashit() the URL
	const urlParts = url.parse( fullUrl.replace( /\/+$/, '/' ) );
	urlParts.protocol = 'https';

	if ( ! localeSlug || 'en' === localeSlug ) {
		if ( 'en.wordpress.com' === urlParts.hostname ) {
			urlParts.host = 'wordpress.com';
			return url.format( urlParts );
		}
		return fullUrl;
	}

	const lookup = [ urlParts.hostname, urlParts.hostname + urlParts.pathname ];

	for ( let i = lookup.length; i >= 0; i-- ) {
		if ( lookup[ i ] in urlLocalizationMapping ) {
			return url.format( urlLocalizationMapping[ lookup[ i ] ]( urlParts, localeSlug ) );
		}
	}

	return fullUrl;
}

export function addLocaleToWpcomUrl( fullUrl, locale ) {
	if ( locale && locale !== 'en' ) {
		return fullUrl.replace( 'https://wordpress.com', 'https://' + locale + '.wordpress.com' );
	}

	return fullUrl;
}

/**
 * Removes the trailing locale slug from the path, if it is present.
 * '/start/en' => '/start', '/start' => '/start', '/start/flow/fr' => '/start/flow', '/start/flow' => '/start/flow'
 * @param {string} path - original path
 * @returns {string} original path minus locale slug
 */
export function removeLocaleFromPath( path ) {
	const urlParts = url.parse( path );
	const queryString = urlParts.search || '';
	const parts = getPathParts( urlParts.pathname );
	const locale = parts.pop();

	if ( 'undefined' === typeof getLanguage( locale ) ) {
		parts.push( locale );
	}

	return parts.join( '/' ) + queryString;
}

/**
 * Returns the slug for the WordPress.com support site for the current user, if
 * any.
 *
 * Uses a (short) list of relatively well-updated *.support.wordpress.com
 * support sites defined in config/_shared.json.
 *
 * @returns {string} A slug which is a valid subdomain of *.support.wordpress.com.
 */
export function getSupportSiteLocale() {
	const localeSlug = getLocaleSlug();
	if ( config( 'support_site_locales' ).indexOf( localeSlug ) > -1 ) {
		return localeSlug;
	}
	return 'en';
}

/**
 * Returns the base url for the forums, for example //{locale}.forums.wordpress.com
 *
 * Checks for a valid bb forum against a list `forum_locales` defined in config/_shared.json.
 *
 * @param {string} localeSlug Forum subdomain locale. Default is getLocaleSlug().
 * @returns {string} //{locale}.forums.wordpress.com
 */
export function getForumUrl( localeSlug = getLocaleSlug() ) {
	if ( config( 'forum_locales' ).indexOf( localeSlug ) > -1 ) {
		return `//${ localeSlug }.forums.wordpress.com`;
	}
	return `//en.forums.wordpress.com`;
}

/**
 * Filter out unexpected values from the given language revisions object.
 *
 * @param {Object} languageRevisions A candidate language revisions object for filtering.
 *
 * @return {Object} A valid language revisions object derived from the given one.
 */
export function filterLanguageRevisions( languageRevisions ) {
	const langSlugs = getLanguageSlugs();

	// Since there is no strong guarantee that the passed-in revisions map will have the identical set of languages as we define in calypso,
	// simply filtering against what we have here should be sufficient.
	return pickBy( languageRevisions, ( revision, slug ) => {
		if ( typeof revision !== 'number' ) {
			return false;
		}

		if ( ! includes( langSlugs, slug ) ) {
			return false;
		}

		return true;
	} );
}
