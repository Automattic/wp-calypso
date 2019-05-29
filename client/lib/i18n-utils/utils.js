/** @format */
/**
 * External dependencies
 */
import { find, isString, map, pickBy, includes, endsWith } from 'lodash';
import url from 'url';
import { getLocaleSlug, registerTranslateHook } from 'i18n-calypso';
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import config from 'config';
import { recordOriginals } from './glotpress';

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
	const urlParts = url.parse( String( fullUrl ) );

	if ( ! urlParts ) {
		return fullUrl;
	}

	// Let's unify the URL.
	urlParts.protocol = 'https';
	if ( 'en.wordpress.com' === urlParts.hostname ) {
		urlParts.host = 'wordpress.com';
	}
	if ( ! endsWith( urlParts.pathname, '.php' ) ) {
		urlParts.pathname = ( urlParts.pathname + '/' ).replace( /\/+$/, '/' );
	}

	if ( ! localeSlug || 'en' === localeSlug ) {
		if ( 'en.wordpress.com' === urlParts.hostname ) {
			urlParts.host = 'wordpress.com';
			return url.format( urlParts );
		}
		return fullUrl;
	}

	const lookup = [ urlParts.hostname, urlParts.hostname + urlParts.pathname ];

	for ( let i = lookup.length - 1; i >= 0; i-- ) {
		if ( lookup[ i ] in urlLocalizationMapping ) {
			return url.format( urlLocalizationMapping[ lookup[ i ] ]( urlParts, localeSlug ) );
		}
	}

	// Nothing needed to be changed, just return it unmodified.
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


class I18nScanner {
	constructor( install = true ) {
		Object.assign( this, {
			installed: false,
			active: false,
			loggedTranslations: [],
			sessionId: null,
			cookieWatcherInterval: null,
			previousCookies: null,
		} );

		install && this.install();
	}

	translationFilter( ...args ) {
		const [ translation, options ] = args;
		if ( this.active ) {
			recordTranslations( options.singular, options.context )
		}

		return translation;
	}

	install() {
		if ( ! config.isEnabled( 'i18n/translation-scanner' ) ) {
			return;
		}

		registerTranslateHook( this.translationFilter.bind( this ) );

		// Watch for cookies changed through browser magic
		this.cookieWatcherInterval = setInterval( this.cookieWatcher.bind( this ), 1000 );
		this.installed = true;
		return this;
	}

	uninstall() {
		clearInterval( this.cookieWatcherInterval );
		// TODO:
		// unregisterTranslateHook( this.translationFilter );
		// this.installed = false;
		return this;
	}

	cookieWatcher() {
		// client-side rendering only
		if ( typeof( document ) === 'undefined' ) {
			return;
		}

		if ( this.previousCookies === document.cookies ) {
			return;
		}

		const newSessionId = cookie.parse( document.cookie )['gp-record'];
		if( newSessionId !== this.sessionId ) {
			this.setSessionId( newSessionId );
		}

	}

	setSessionId( newSessionId ) {
		this.sessionId = newSessionId;

		newSessionId
			? this.start()
			: this.stop();
	}

	start() {
		if ( ! config.isEnabled( 'i18n/translation-scanner' ) ) {
			return;
		}

		if ( ! this.installed ) {
			this.install();
		}
		this.clear();
		this.active = true;
	}

	stop() {
		this.active = false;
		return this.loggedTranslations;
	}

	clear() {
		this.loggedTranslations = [];
		return this.loggedTranslations;
	}

	format( translation, options ) {
		const { original, context, plural /*, ...rest*/ } = options;
		return `translation: ${ translation }, original: ${ original }, context: ${ context }, plural: ${ plural }`;
	}

	report( translations = this.loggedTranslations ) {
		translations.map( ( [ translation, options ] ) =>
			// eslint-disable-next-line no-console
			console.log( this.format( translation, options ) )
		);
	}
}

// eslint-disable-next-line no-console
console.log( 'Installing i18nScanner at global.i18nScanner' );
export const i18nScanner = new I18nScanner();
global.i18nScanner = i18nScanner;
