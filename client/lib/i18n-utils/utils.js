/**
 * External dependencies
 */
import { find, isString, map, pickBy, includes, endsWith } from 'lodash';
import { getLocaleSlug, hasTranslation } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { languages } from 'languages';
import { getUrlParts, getUrlFromParts } from 'lib/url/url-parts';

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
 * @returns {boolean} true when the default locale is provided
 */
export function isDefaultLocale( locale ) {
	return locale === config( 'i18n_default_locale_slug' );
}

/**
 * Checks if provided locale has a parentLangSlug and is therefore a locale variant
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @returns {boolean} true when the locale has a parentLangSlug
 */
export function isLocaleVariant( locale ) {
	if ( ! isString( locale ) ) {
		return false;
	}
	const language = getLanguage( locale );
	return !! language && isString( language.parentLangSlug );
}

export function isLocaleRtl( locale ) {
	if ( ! isString( locale ) ) {
		return null;
	}
	const language = getLanguage( locale );
	if ( ! language ) {
		return null;
	}

	return Boolean( language.rtl );
}

/**
 * Checks against a list of locales that don't have any GP translation sets
 * A 'translation set' refers to a collection of strings to be translated see:
 * https://glotpress.blog/the-manual/translation-sets/
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @returns {boolean} true when the locale is NOT a member of the exception list
 */
export function canBeTranslated( locale ) {
	return [ 'en', 'sr_latin' ].indexOf( locale ) === -1;
}

/**
 * To be used with the same parameters as i18n-calpyso's translate():
 * Check whether the user would be exposed to text not in their language.
 *
 * Since the text is in English, this is always true in that case. Otherwise
 * We check whether a translation was provided for this text.
 *
 * @returns {boolean} true when a user would see text they can read.
 */
export function translationExists() {
	const localeSlug = typeof getLocaleSlug === 'function' ? getLocaleSlug() : 'en';
	return isDefaultLocale( localeSlug ) || hasTranslation.apply( null, arguments );
}

/**
 * Return a list of all supported language slugs
 *
 * @returns {Array} A list of all supported language slugs
 */
export function getLanguageSlugs() {
	return map( languages, 'langSlug' );
}

/**
 * Matches and returns language from config.languages based on the given localeSlug
 *
 * @param   {string} langSlug locale slug of the language to match
 * @returns {object|undefined} An object containing the locale data or undefined.
 */
export function getLanguage( langSlug ) {
	if ( localeRegex.test( langSlug ) ) {
		// Find for the langSlug first. If we can't find it, split it and find its parent slug.
		// Please see the comment above `localeRegex` to see why we can split by - or _ and find the parent slug.
		return (
			find( languages, { langSlug } ) ||
			find( languages, { langSlug: langSlug.split( /[-_]/ )[ 0 ] } )
		);
	}

	return undefined;
}

/**
 * Assuming that locale is adding at the end of path, retrieves the locale if present.
 *
 * @param {string} path - original path
 * @returns {string|undefined} The locale slug if present or undefined
 */
export function getLocaleFromPath( path ) {
	const urlParts = getUrlParts( path );
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
	const urlParts = getUrlParts( path );
	const queryString = urlParts.search || '';

	return removeLocaleFromPath( urlParts.pathname ) + `/${ locale }` + queryString;
}

const localesWithBlog = [ 'en', 'ja', 'es', 'pt', 'fr', 'pt-br' ];
const localesWithPrivacyPolicy = [ 'en', 'fr', 'de' ];
const localesWithCookiePolicy = [ 'en', 'fr', 'de' ];

const setLocalizedUrlHost = ( hostname, validLocales = [] ) => ( urlParts, localeSlug ) => {
	const localesToSubdomains = {
		'pt-br': 'br',
		br: 'bre',
		zh: 'zh-cn',
		'zh-hk': 'zh-tw',
		'zh-sg': 'zh-cn',
		kr: 'ko',
	};

	if ( typeof validLocales === 'string' ) {
		validLocales = config( validLocales );
	}

	if ( validLocales.includes( localeSlug ) ) {
		urlParts.host = `${ localesToSubdomains[ localeSlug ] || localeSlug }.${ hostname }`;
	}
	return urlParts;
};

const prefixLocalizedUrlPath = ( validLocales = [] ) => ( urlParts, localeSlug ) => {
	if ( typeof validLocales === 'string' ) {
		validLocales = config( validLocales );
	}
	if ( validLocales.includes( localeSlug ) ) {
		urlParts.pathname = localeSlug + urlParts.pathname;
	}
	return urlParts;
};

const urlLocalizationMapping = {
	'wordpress.com': setLocalizedUrlHost( 'wordpress.com', 'magnificent_non_en_locales' ),
	'wordpress.com/tos/': setLocalizedUrlHost( 'wordpress.com', 'magnificent_non_en_locales' ),
	'jetpack.com': setLocalizedUrlHost( 'jetpack.com', 'jetpack_com_locales' ),
	'en.support.wordpress.com': setLocalizedUrlHost(
		'support.wordpress.com',
		'support_site_locales'
	),
	'en.blog.wordpress.com': setLocalizedUrlHost( 'blog.wordpress.com', localesWithBlog ),
	'en.forums.wordpress.com': setLocalizedUrlHost( 'forums.wordpress.com', 'forum_locales' ),
	'automattic.com/privacy/': prefixLocalizedUrlPath( localesWithPrivacyPolicy ),
	'automattic.com/cookies/': prefixLocalizedUrlPath( localesWithCookiePolicy ),
};

export function localizeUrl( fullUrl, locale ) {
	const localeSlug = locale || ( typeof getLocaleSlug === 'function' ? getLocaleSlug() : 'en' );
	const urlParts = getUrlParts( String( fullUrl ) );

	if ( ! urlParts.host ) {
		return fullUrl;
	}

	// Let's unify the URL.
	urlParts.protocol = 'https:';
	// Let's use `host` for everything.
	delete urlParts.hostname;

	if ( ! endsWith( urlParts.pathname, '.php' ) ) {
		urlParts.pathname = ( urlParts.pathname + '/' ).replace( /\/+$/, '/' );
	}

	if ( ! localeSlug || 'en' === localeSlug ) {
		if ( 'en.wordpress.com' === urlParts.host ) {
			urlParts.host = 'wordpress.com';
			return getUrlFromParts( urlParts ).href;
		}
		return fullUrl;
	}

	if ( 'en.wordpress.com' === urlParts.host ) {
		urlParts.host = 'wordpress.com';
	}

	const lookup = [ urlParts.host, urlParts.host + urlParts.pathname ];

	for ( let i = lookup.length - 1; i >= 0; i-- ) {
		if ( lookup[ i ] in urlLocalizationMapping ) {
			return getUrlFromParts( urlLocalizationMapping[ lookup[ i ] ]( urlParts, localeSlug ) ).href;
		}
	}

	// Nothing needed to be changed, just return it unmodified.
	return fullUrl;
}

/**
 * Removes the trailing locale slug from the path, if it is present.
 * '/start/en' => '/start', '/start' => '/start', '/start/flow/fr' => '/start/flow', '/start/flow' => '/start/flow'
 *
 * @param {string} path - original path
 * @returns {string} original path minus locale slug
 */
export function removeLocaleFromPath( path ) {
	const urlParts = getUrlParts( path );
	const queryString = urlParts.search || '';
	const parts = getPathParts( urlParts.pathname );
	const locale = parts.pop();

	if ( 'undefined' === typeof getLanguage( locale ) ) {
		parts.push( locale );
	}

	return parts.join( '/' ) + queryString;
}

/**
 * Filter out unexpected values from the given language revisions object.
 *
 * @param {object} languageRevisions A candidate language revisions object for filtering.
 *
 * @returns {object} A valid language revisions object derived from the given one.
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

/**
 * Potentially rewrite the timezone to what we have on the server-side.
 *
 * @param {string} A timezone string, like Asia/Calcutta.
 *
 * @returns {string} A potentially rewritten timezone string, like Asia/Kolkata.
 */

export function maybeRewriteTimezone( timezone ) {
	// This list comes from https://github.com/eggert/tz/blob/master/backward
	const linkedTimezones = {
		'Africa/Asmera': 'Africa/Nairobi',
		'Africa/Timbuktu': 'Africa/Abidjan',
		'America/Argentina/ComodRivadavia': 'America/Argentina/Catamarca',
		'America/Atka': 'America/Adak',
		'America/Buenos_Aires': 'America/Argentina/Buenos_Aires',
		'America/Catamarca': 'America/Argentina/Catamarca',
		'America/Coral_Harbour': 'America/Atikokan',
		'America/Cordoba': 'America/Argentina/Cordoba',
		'America/Ensenada': 'America/Tijuana',
		'America/Fort_Wayne': 'America/Indiana/Indianapolis',
		'America/Indianapolis': 'America/Indiana/Indianapolis',
		'America/Jujuy': 'America/Argentina/Jujuy',
		'America/Knox_IN': 'America/Indiana/Knox',
		'America/Louisville': 'America/Kentucky/Louisville',
		'America/Mendoza': 'America/Argentina/Mendoza',
		'America/Montreal': 'America/Toronto',
		'America/Porto_Acre': 'America/Rio_Branco',
		'America/Rosario': 'America/Argentina/Cordoba',
		'America/Santa_Isabel': 'America/Tijuana',
		'America/Shiprock': 'America/Denver',
		'America/Virgin': 'America/Port_of_Spain',
		'Antarctica/South_Pole': 'Pacific/Auckland',
		'Asia/Ashkhabad': 'Asia/Ashgabat',
		'Asia/Calcutta': 'Asia/Kolkata',
		'Asia/Chongqing': 'Asia/Shanghai',
		'Asia/Chungking': 'Asia/Shanghai',
		'Asia/Dacca': 'Asia/Dhaka',
		'Asia/Harbin': 'Asia/Shanghai',
		'Asia/Kashgar': 'Asia/Urumqi',
		'Asia/Katmandu': 'Asia/Kathmandu',
		'Asia/Macao': 'Asia/Macau',
		'Asia/Rangoon': 'Asia/Yangon',
		'Asia/Saigon': 'Asia/Ho_Chi_Minh',
		'Asia/Tel_Aviv': 'Asia/Jerusalem',
		'Asia/Thimbu': 'Asia/Thimphu',
		'Asia/Ujung_Pandang': 'Asia/Makassar',
		'Asia/Ulan_Bator': 'Asia/Ulaanbaatar',
		'Atlantic/Faeroe': 'Atlantic/Faroe',
		'Atlantic/Jan_Mayen': 'Europe/Oslo',
		'Australia/ACT': 'Australia/Sydney',
		'Australia/Canberra': 'Australia/Sydney',
		'Australia/LHI': 'Australia/Lord_Howe',
		'Australia/NSW': 'Australia/Sydney',
		'Australia/North': 'Australia/Darwin',
		'Australia/Queensland': 'Australia/Brisbane',
		'Australia/South': 'Australia/Adelaide',
		'Australia/Tasmania': 'Australia/Hobart',
		'Australia/Victoria': 'Australia/Melbourne',
		'Australia/West': 'Australia/Perth',
		'Australia/Yancowinna': 'Australia/Broken_Hill',
		'Brazil/Acre': 'America/Rio_Branco',
		'Brazil/DeNoronha': 'America/Noronha',
		'Brazil/East': 'America/Sao_Paulo',
		'Brazil/West': 'America/Manaus',
		'Canada/Atlantic': 'America/Halifax',
		'Canada/Central': 'America/Winnipeg',
		'Canada/Eastern': 'America/Toronto',
		'Canada/Mountain': 'America/Edmonton',
		'Canada/Newfoundland': 'America/St_Johns',
		'Canada/Pacific': 'America/Vancouver',
		'Canada/Saskatchewan': 'America/Regina',
		'Canada/Yukon': 'America/Whitehorse',
		'Europe/Belfast': 'Europe/London',
		'Europe/Tiraspol': 'Europe/Chisinau',
		'Mexico/BajaNorte': 'America/Tijuana',
		'Mexico/BajaSur': 'America/Mazatlan',
		'Mexico/General': 'America/Mexico_City',
		'Pacific/Johnston': 'Pacific/Honolulu',
		'Pacific/Ponape': 'Pacific/Pohnpei',
		'Pacific/Samoa': 'Pacific/Pago_Pago',
		'Pacific/Truk': 'Pacific/Chuuk',
		'Pacific/Yap': 'Pacific/Chuuk',
	};

	if ( timezone in linkedTimezones ) {
		return linkedTimezones[ timezone ];
	}

	return timezone;
}
