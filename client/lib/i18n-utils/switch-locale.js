/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import debugFactory from 'debug';
import { forEach, includes, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { isDefaultLocale, getLanguage } from './utils';
import { getUrlFromParts, getUrlParts } from 'calypso/lib/url/url-parts';

const debug = debugFactory( 'calypso:i18n' );

const getPromises = {};

/**
 * De-duplicates repeated GET fetches of the same URL while one is taking place.
 * Once it's finished, it'll allow for the same request to be done again.
 *
 * @param {string} url The URL to fetch
 *
 * @returns {Promise} The fetch promise.
 */
function dedupedGet( url ) {
	if ( ! ( url in getPromises ) ) {
		getPromises[ url ] = globalThis.fetch( url ).finally( () => delete getPromises[ url ] );
	}

	return getPromises[ url ];
}

/**
 * Get the protocol, domain, and path part of the language file URL.
 * Normally it should only serve as a helper function for `getLanguageFileUrl`,
 * but we export it here still in help with the test suite.
 *
 * @returns {string} The path URL to the language files.
 */
export function getLanguageFilePathUrl() {
	const protocol = typeof window === 'undefined' ? 'https://' : '//'; // use a protocol-relative path in the browser

	return `${ protocol }widgets.wp.com/languages/calypso/`;
}

/**
 * Get the base path for language related files that are served from within Calypso.
 *
 * @param {string} targetBuild The build target. e.g. fallback, evergreen, etc.
 * @returns {string} The internal base file path for language files.
 */
export function getLanguagesInternalBasePath( targetBuild = 'evergreen' ) {
	return `/calypso/${ targetBuild }/languages`;
}

/**
 * Get the language file URL for the given locale and file type, js or json.
 * A revision cache buster will be appended automatically if `setLangRevisions` has been called beforehand.
 *
 * @param {string} localeSlug A locale slug. e.g. fr, jp, zh-tw
 * @param {string} fileType The desired file type, js or json. Default to json.
 * @param {object} languageRevisions An optional language revisions map. If it exists, the function will append the revision within as cache buster.
 *
 * @returns {string} A language file URL.
 */
export function getLanguageFileUrl( localeSlug, fileType = 'json', languageRevisions = {} ) {
	if ( ! includes( [ 'js', 'json' ], fileType ) ) {
		fileType = 'json';
	}

	const revision = languageRevisions[ localeSlug ];
	const fileUrl = `${ getLanguageFilePathUrl() }${ localeSlug }-v1.1.${ fileType }`;

	return typeof revision === 'number' ? fileUrl + `?v=${ revision }` : fileUrl;
}

function getHtmlLangAttribute() {
	// translation of this string contains the desired HTML attribute value
	const slug = i18n.translate( 'html_lang_attribute' );

	// Hasn't been translated? Some languages don't have the translation for this string,
	// or maybe we are dealing with the default `en` locale. Return the general purpose locale slug
	// -- there's no special one available for `<html lang>`.
	if ( slug === 'html_lang_attribute' ) {
		return i18n.getLocaleSlug();
	}

	return slug;
}

function setLocaleInDOM() {
	const htmlLangAttribute = getHtmlLangAttribute();
	const isRTL = i18n.isRtl();
	document.documentElement.lang = htmlLangAttribute;
	document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
	document.body.classList[ isRTL ? 'add' : 'remove' ]( 'rtl' );

	switchWebpackCSS( isRTL );
}

export async function getFile( url ) {
	const response = await dedupedGet( url );
	if ( response.ok ) {
		if ( response.bodyUsed ) {
			// If the body was already used, we assume that we already parsed the
			// response and set the locale in the DOM, so we don't need to do anything
			// else here.
			return;
		}
		return await response.json();
	}

	// Invalid response.
	throw new Error();
}

export function getLanguageFile( targetLocaleSlug ) {
	const url = getLanguageFileUrl( targetLocaleSlug, 'json', window.languageRevisions || {} );

	return getFile( url );
}

/**
 * Get the language manifest file URL for the given locale.
 * A revision cache buster will be appended automatically if `setLangRevisions` has been called beforehand.
 *
 * @param {string} options Funciton options object
 * @param {string} options.localeSlug A locale slug. e.g. fr, jp, zh-tw
 * @param {string} options.fileType The desired file type, js or json. Default to json.
 * @param {string} options.targetBuild The build target. e.g. fallback, evergreen, etc.
 * @param {string} options.hash Build hash string that will be used as cache buster.
 *
 * @returns {string} A language manifest file URL.
 */

export function getLanguageManifestFileUrl( {
	localeSlug,
	fileType = 'json',
	targetBuild = 'evergreen',
	hash = null,
} = {} ) {
	if ( ! includes( [ 'js', 'json' ], fileType ) ) {
		fileType = 'json';
	}

	if ( typeof hash === 'number' ) {
		hash = hash.toString();
	}

	const fileBasePath = getLanguagesInternalBasePath( targetBuild );
	const fileUrl = `${ fileBasePath }/${ localeSlug }-language-manifest.${ fileType }`;

	return typeof hash === 'string' ? fileUrl + `?v=${ hash }` : fileUrl;
}

/**
 * Get the language manifest file for the given locale.
 *
 * @param  {string} localeSlug A locale slug. e.g. fr, jp, zh-tw
 * @param  {string} targetBuild The build target. e.g. fallback, evergreen, etc.
 *
 * @returns {Promise} Language manifest json content
 */
export function getLanguageManifestFile( localeSlug, targetBuild = 'evergreen' ) {
	if (
		window?.i18nLanguageManifest &&
		window?.i18nLanguageManifest?.locale?.[ '' ]?.localeSlug === localeSlug
	) {
		return Promise.resolve( window.i18nLanguageManifest );
	}

	const url = getLanguageManifestFileUrl( {
		localeSlug,
		fileType: 'json',
		targetBuild,
		hash: window?.languageRevisions?.hashes?.[ localeSlug ] || null,
	} );

	return getFile( url );
}

/**
 * Get the translation chunk file URL for the given chunk id and locale.
 * A revision cache buster will be appended automatically if `setLangRevisions` has been called beforehand.
 *
 * @param {string} options Funciton options object
 * @param {string} options.chunkId A chunk id. e.g. chunk-abc.min
 * @param {string} options.localeSlug A locale slug. e.g. fr, jp, zh-tw
 * @param {string} options.fileType The desired file type, js or json. Default to json.
 * @param {string} options.buildTarget The build target. e.g. fallback, evergreen, etc.
 * @param {string} options.hash Build hash string that will be used as cache buster.
 *
 * @returns {string} A translation chunk file URL.
 */
export function getTranslationChunkFileUrl( {
	chunkId,
	localeSlug,
	fileType = 'json',
	targetBuild = 'evergreen',
	hash = null,
} = {} ) {
	if ( ! includes( [ 'js', 'json' ], fileType ) ) {
		fileType = 'json';
	}

	if ( typeof hash === 'number' ) {
		hash = hash.toString();
	}

	const fileBasePath = getLanguagesInternalBasePath( targetBuild );
	const fileName = `${ localeSlug }-${ chunkId }.${ fileType }`;
	const fileUrl = `${ fileBasePath }/${ fileName }`;

	return typeof hash === 'string' ? fileUrl + `?v=${ hash }` : fileUrl;
}

/**
 * Get the translation chunk file for the given chunk id and locale.
 *
 * @param {string} chunkId A chunk id. e.g. chunk-abc.min
 * @param {string} localeSlug A locale slug. e.g. fr, jp, zh-tw
 * @param {string} targetBuild The build target. e.g. fallback, evergreen, etc.
 *
 * @returns {Promise} Translation chunk json content
 */
export function getTranslationChunkFile( chunkId, localeSlug, targetBuild = 'evergreen' ) {
	if (
		window?.i18nLanguageManifest?.locale?.[ '' ]?.localeSlug === localeSlug &&
		window?.i18nTranslationChunks?.[ chunkId ]
	) {
		return Promise.resolve( window.i18nTranslationChunks[ chunkId ] );
	}

	const url = getTranslationChunkFileUrl( {
		chunkId,
		localeSlug,
		fileType: 'json',
		targetBuild,
		hash: window?.languageRevisions?.[ localeSlug ] || null,
	} );

	return getFile( url );
}

function getInstalledChunks() {
	const installedChunksFromContext = window.installedChunks ?? [];
	const installedChunksAsync = window?.__requireChunkCallback__?.getInstalledChunks?.() ?? [];
	const installedChunksSet = new Set(
		[].concat( installedChunksFromContext, installedChunksAsync )
	);

	return Array.from( installedChunksSet );
}

async function getTranslationChunksLocale( localeSlug, buildTarget = 'evergreen' ) {
	try {
		const { translatedChunks, locale } =
			( await getLanguageManifestFile( localeSlug, buildTarget ) ) ?? {};

		if ( ! locale || ! translatedChunks ) {
			return;
		}

		const translatedInstalledChunks = getInstalledChunks().filter( ( chunkId ) =>
			translatedChunks.includes( chunkId )
		);
		const chunksLocaleData = await Promise.all(
			translatedInstalledChunks.map( ( chunkId ) =>
				getTranslationChunkFile( chunkId, localeSlug, buildTarget )
			)
		);

		const localeData = Object.assign( {}, locale, ...chunksLocaleData );

		return { localeData, translatedChunks };
	} catch ( error ) {
		debug(
			`Encountered an error loading language manifest and/or translation chunks for ${ localeSlug }. Falling back to English.`
		);
		debug( error );
	}
}

let lastRequireChunkTranslationsHandler = null;

function addRequireChunkTranslationsHandler(
	localeSlug = i18n.getLocaleSlug(),
	buildTarget = 'evergreen',
	{ translatedChunks = [], userTranslations = {} }
) {
	const loadedTranslationChunks = {};

	const handler = ( { scriptSrc, publicPath }, promises ) => {
		const chunkId = scriptSrc.replace( publicPath, '' ).replace( /\.js$/, '' );

		if ( ! translatedChunks.includes( chunkId ) || loadedTranslationChunks[ chunkId ] ) {
			return;
		}

		const translationChunkPromise = getTranslationChunkFile(
			chunkId,
			localeSlug,
			buildTarget
		).then( ( translations ) => {
			i18n.addTranslations( { ...translations, ...userTranslations } );
			loadedTranslationChunks[ chunkId ] = true;
		} );

		promises.push( translationChunkPromise );
	};

	window?.__requireChunkCallback__?.add?.( handler );
	lastRequireChunkTranslationsHandler = handler;
}

function removeRequireChunkTranslationsHandler() {
	window?.__requireChunkCallback__?.remove?.( lastRequireChunkTranslationsHandler );
}

let lastRequestedLocale = null;
export default async function switchLocale( localeSlug ) {
	// check if the language exists in config.languages
	const language = getLanguage( localeSlug );

	if ( ! language ) {
		return;
	}

	// Note: i18n is a singleton that will be shared between all server requests!
	// Disable switching locale on the server
	if ( typeof document === 'undefined' ) {
		return;
	}

	lastRequestedLocale = localeSlug;

	const useTranslationChunks =
		config.isEnabled( 'use-translation-chunks' ) ||
		getUrlParts( document.location.href ).searchParams.has( 'useTranslationChunks' );

	if ( isDefaultLocale( localeSlug ) ) {
		i18n.configure( { defaultLocaleSlug: localeSlug } );
		setLocaleInDOM();
	} else if ( useTranslationChunks ) {
		// If requested locale is same as current locale, we don't need to
		// re-fetch the manifest and translation chunks.
		if ( localeSlug === i18n.getLocaleSlug() ) {
			setLocaleInDOM();
			return;
		}

		// Switching the locale requires fetching the translation chunks
		// locale data, which consists of the locale manifest data and
		// translations for currently installed chunks.
		const { localeData, translatedChunks } =
			( await getTranslationChunksLocale( localeSlug, window?.BUILD_TARGET ) ) ?? {};

		if ( isEmpty( localeData ) ) {
			return;
		}

		i18n.setLocale( localeData );
		setLocaleInDOM();
		addRequireChunkTranslationsHandler( localeSlug, window?.BUILD_TARGET, { translatedChunks } );

		const userTranslations = await loadUserUndeployedTranslations( localeSlug );

		// Re-attach require chunk translations handler if user translations are available
		if ( userTranslations ) {
			removeRequireChunkTranslationsHandler();
			addRequireChunkTranslationsHandler( localeSlug, window?.BUILD_TARGET, {
				translatedChunks,
				userTranslations,
			} );
		}
	} else {
		getLanguageFile( localeSlug ).then(
			// Success.
			( body ) => {
				if ( body ) {
					// Handle race condition when we're requested to switch to a different
					// locale while we're in the middle of request, we should abandon result
					if ( localeSlug !== lastRequestedLocale ) {
						return;
					}

					i18n.setLocale( body );
					setLocaleInDOM();
					loadUserUndeployedTranslations( localeSlug );
				}
			},
			// Failure.
			() => {
				debug(
					`Encountered an error loading locale file for ${ localeSlug }. Falling back to English.`
				);
			}
		);
	}
}

export function loadUserUndeployedTranslations( currentLocaleSlug ) {
	if ( typeof window === 'undefined' || ! window.location || ! window.location.search ) {
		return;
	}

	const search = new URLSearchParams( window.location.search );
	const params = Object.fromEntries( search.entries() );

	const {
		'load-user-translations': username,
		project = 'wpcom',
		translationSet = 'default',
		translationStatus = 'current',
		locale = currentLocaleSlug,
	} = params;

	if ( ! username ) {
		return;
	}

	if ( ! includes( [ 'current', 'waiting' ], translationStatus ) ) {
		return;
	}

	if ( 'waiting' === translationStatus ) {
		// TODO only allow loading your own waiting translations. Disallow loading them for now.
		return;
	}

	const pathname = [
		'api',
		'projects',
		project,
		locale,
		translationSet,
		'export-translations',
	].join( '/' );

	const searchParams = new URLSearchParams( {
		'filters[user_login]': username,
		'filters[status]': translationStatus,
		format: 'json',
	} );

	const requestUrl = getUrlFromParts( {
		protocol: 'https:',
		host: 'translate.wordpress.com',
		pathname,
		searchParams,
	} );

	return window
		.fetch( requestUrl.href, {
			headers: { Accept: 'application/json' },
			credentials: 'include',
		} )
		.then( ( res ) => res.json() )
		.then( ( translations ) => {
			i18n.addTranslations( translations );

			return translations;
		} );
}

/*
 * CSS links come in two flavors: either RTL stylesheets with `.rtl.css` suffix, or LTR ones
 * with `.css` suffix. This function sets a desired `isRTL` flag on the supplied URL, i.e., it
 * changes the extension if necessary.
 */
function setRTLFlagOnCSSLink( url, isRTL ) {
	if ( isRTL ) {
		return url.endsWith( '.rtl.css' ) ? url : url.replace( /\.css$/, '.rtl.css' );
	}

	return ! url.endsWith( '.rtl.css' ) ? url : url.replace( /\.rtl.css$/, '.css' );
}

/**
 * Switch the Calypso CSS between RTL and LTR versions.
 *
 * @param {boolean} isRTL True to use RTL css.
 */
export function switchWebpackCSS( isRTL ) {
	const currentLinks = document.querySelectorAll( 'link[rel="stylesheet"][data-webpack]' );

	forEach( currentLinks, async ( currentLink ) => {
		const currentHref = currentLink.getAttribute( 'href' );
		const newHref = setRTLFlagOnCSSLink( currentHref, isRTL );
		if ( currentHref === newHref ) {
			return;
		}

		const newLink = await loadCSS( newHref, currentLink );
		newLink.setAttribute( 'data-webpack', true );

		if ( currentLink.parentElement ) {
			currentLink.parentElement.removeChild( currentLink );
		}
	} );
}

/**
 * Loads a CSS stylesheet into the page.
 *
 * @param {string} cssUrl URL of a CSS stylesheet to be loaded into the page
 * @param {window.Element} currentLink an existing <link> DOM element before which we want to insert the new one
 * @returns {Promise<string>} the new <link> DOM element after the CSS has been loaded
 */
function loadCSS( cssUrl, currentLink ) {
	return new Promise( ( resolve ) => {
		const link = document.createElement( 'link' );
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = cssUrl;

		if ( 'onload' in link ) {
			link.onload = () => {
				link.onload = null;
				resolve( link );
			};
		} else {
			// just wait 500ms if the browser doesn't support link.onload
			// https://pie.gd/test/script-link-events/
			// https://github.com/ariya/phantomjs/issues/12332
			setTimeout( () => resolve( link ), 500 );
		}

		document.head.insertBefore( link, currentLink ? currentLink.nextSibling : null );
	} );
}
