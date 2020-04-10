/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import debugFactory from 'debug';
import { forEach, includes } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { isDefaultLocale, getLanguage } from './utils';
import { getUrlFromParts } from 'lib/url/url-parts';

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
 * @returns {string} The internal base file path for language files.
 */
export function getLanguagesInternalBasePath() {
	if ( ! window || ! window.__requireChunkCallback__ ) {
		return '/calypso/evergreen/languages';
	}

	return window.__requireChunkCallback__.getPublicPath() + 'languages';
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
 * @param {string} localeSlug A locale slug. e.g. fr, jp, zh-tw
 * @param {object} languageRevisions An optional language revisions map. If it exists, the function will append the revision within as cache buster.
 *
 * @returns {string} A language manifest file URL.
 */
export function getLanguageManifestFileUrl( localeSlug, languageRevisions = {} ) {
	const revision = languageRevisions[ localeSlug ];
	const fileUrl = `${ getLanguagesInternalBasePath() }/${ localeSlug }-language-manifest.json`;

	return typeof revision === 'number' ? fileUrl + `?v=${ revision }` : fileUrl;
}

/**
 * Get the language manifest file for the given locale.
 *
 * @param  {string} targetLocaleSlug A locale slug. e.g. fr, jp, zh-tw
 *
 * @returns {Promise} Language manifest json content
 */
export function getLanguageManifestFile( targetLocaleSlug ) {
	const url = getLanguageManifestFileUrl( targetLocaleSlug, window.languageRevisions || {} );

	return getFile( url );
}

/**
 * Get the translation chunk file URL for the given chunk id and locale.
 * A revision cache buster will be appended automatically if `setLangRevisions` has been called beforehand.
 *
 * @param {string} chunkId A chunk id. e.g. chunk-abc.min
 * @param {string} localeSlug A locale slug. e.g. fr, jp, zh-tw
 * @param {object} languageRevisions An optional language revisions map. If it exists, the function will append the revision within as cache buster.
 *
 * @returns {string} A translation chunk file URL.
 */
export function getTranslationChunkFileUrl( chunkId, localeSlug, languageRevisions = {} ) {
	const revision = languageRevisions[ localeSlug ];
	const fileUrl = `${ getLanguagesInternalBasePath() }/${ localeSlug }-${ chunkId }.json`;

	return typeof revision === 'number' ? fileUrl + `?v=${ revision }` : fileUrl;
}

/**
 * Get the translation chunk file for the given chunk id and locale.
 *
 * @param {string} chunkId A chunk id. e.g. chunk-abc.min
 * @param  {string} targetLocaleSlug A locale slug. e.g. fr, jp, zh-tw
 *
 * @returns {Promise} Translation chunk json content
 */
export function getTranslationChunkFile( chunkId, targetLocaleSlug ) {
	const url = getTranslationChunkFileUrl(
		chunkId,
		targetLocaleSlug,
		window.languageRevisions || {}
	);

	return getFile( url );
}

let lastRequestedLocale = null;
export default function switchLocale( localeSlug ) {
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

	if ( config.isEnabled( 'use-translation-chunks' ) ) {
		i18n.configure( { defaultLocaleSlug: localeSlug } );
		setLocaleInDOM();

		return;
	}

	if ( isDefaultLocale( localeSlug ) ) {
		i18n.configure( { defaultLocaleSlug: localeSlug } );
		setLocaleInDOM();
	} else {
		getLanguageFile( localeSlug ).then(
			// Success.
			body => {
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

	const query = {
		'filters[user_login]': username,
		'filters[status]': translationStatus,
		format: 'json',
	};

	const requestUrl = getUrlFromParts( {
		protocol: 'https:',
		host: 'translate.wordpress.com',
		pathname,
		query,
	} );

	return window
		.fetch( requestUrl.href, {
			headers: { Accept: 'application/json' },
			credentials: 'include',
		} )
		.then( res => res.json() )
		.then( translations => i18n.addTranslations( translations ) );
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

	forEach( currentLinks, async currentLink => {
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
	return new Promise( resolve => {
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
