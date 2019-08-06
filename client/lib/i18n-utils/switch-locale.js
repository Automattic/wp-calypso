/**
 * External dependencies
 */
import i18n from 'i18n-calypso';
import debugFactory from 'debug';
import { map, includes } from 'lodash';
import { parse as parseUrl, format as formatUrl } from 'url';

/**
 * Internal dependencies
 */
import { isDefaultLocale, getLanguage } from './utils';

const debug = debugFactory( 'calypso:i18n' );

const getPromises = {};

/**
 * De-duplicates repeated GET fetches of the same URL while one is taking place.
 * Once it's finished, it'll allow for the same request to be done again.
 * @param {string} url The URL to fetch
 *
 * @returns {Promise} The fetch promise.
 */
function dedupedGet( url ) {
	if ( ! ( url in getPromises ) ) {
		getPromises[ url ] = fetch( url ).finally( () => delete getPromises[ url ] );
	}

	return getPromises[ url ];
}

/**
 * Get the protocol, domain, and path part of the language file URL.
 * Normally it should only serve as a helper function for `getLanguageFileUrl`,
 * but we export it here still in help with the test suite.
 *
 * @return {String} The path URL to the language files.
 */
export function getLanguageFilePathUrl() {
	const protocol = typeof window === 'undefined' ? 'https://' : '//'; // use a protocol-relative path in the browser

	return `${ protocol }widgets.wp.com/languages/calypso/`;
}

/**
 * Get the language file URL for the given locale and file type, js or json.
 * A revision cache buster will be appended automatically if `setLangRevisions` has been called beforehand.
 *
 * @param {String} localeSlug A locale slug. e.g. fr, jp, zh-tw
 * @param {String} fileType The desired file type, js or json. Default to json.
 * @param {Object} languageRevisions An optional language revisions map. If it exists, the function will append the revision within as cache buster.
 *
 * @return {String} A language file URL.
 */
export function getLanguageFileUrl( localeSlug, fileType = 'json', languageRevisions = {} ) {
	if ( ! includes( [ 'js', 'json' ], fileType ) ) {
		fileType = 'json';
	}

	const revision = languageRevisions[ localeSlug ];
	const fileUrl = `${ getLanguageFilePathUrl() }${ localeSlug }-v1.1.${ fileType }`;

	return typeof revision === 'number' ? fileUrl + `?v=${ revision }` : fileUrl;
}

function setLocaleInDOM( localeSlug, isRTL ) {
	document.documentElement.lang = localeSlug;
	document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
	document.body.classList[ isRTL ? 'add' : 'remove' ]( 'rtl' );

	const directionFlag = isRTL ? '-rtl' : '';
	const debugFlag = process.env.NODE_ENV === 'development' ? '-debug' : '';
	const cssUrl = window.app.staticUrls[ `style${ debugFlag }${ directionFlag }.css` ];

	switchCSS( 'main-css', cssUrl );
	switchWebpackCSS( isRTL );
}

async function getLanguageFile( targetLocaleSlug ) {
	const url = getLanguageFileUrl( targetLocaleSlug );

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

	const { langSlug: targetLocaleSlug, parentLangSlug } = language;

	// variant lang objects contain references to their parent lang, which is what we want to tell the browser we're running
	const domLocaleSlug = parentLangSlug || targetLocaleSlug;

	lastRequestedLocale = targetLocaleSlug;

	if ( isDefaultLocale( targetLocaleSlug ) ) {
		i18n.configure( { defaultLocaleSlug: targetLocaleSlug } );
		setLocaleInDOM( domLocaleSlug, !! language.rtl );
	} else {
		getLanguageFile( targetLocaleSlug ).then(
			// Success.
			body => {
				if ( body ) {
					// Handle race condition when we're requested to switch to a different
					// locale while we're in the middle of request, we should abandon result
					if ( targetLocaleSlug !== lastRequestedLocale ) {
						return;
					}

					i18n.setLocale( body );

					setLocaleInDOM( domLocaleSlug, !! language.rtl );

					loadUserUndeployedTranslations( targetLocaleSlug );
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
	if ( ! location || ! location.search ) {
		return;
	}

	const parsedURL = parseUrl( location.search, true );

	const {
		'load-user-translations': username,
		project = 'wpcom',
		translationSet = 'default',
		translationStatus = 'current',
		locale = currentLocaleSlug,
	} = parsedURL.query;

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

	const requestUrl = formatUrl( {
		protocol: 'https:',
		host: 'translate.wordpress.com',
		pathname,
		query,
	} );

	return fetch( requestUrl, {
		headers: { Accept: 'application/json' },
		credentials: 'include',
	} )
		.then( res => res.json() )
		.then( translations => i18n.addTranslations( translations ) );
}

const bundles = {};

async function switchCSS( elementId, cssUrl ) {
	if ( bundles.hasOwnProperty( elementId ) && bundles[ elementId ] === cssUrl ) {
		return;
	}

	bundles[ elementId ] = cssUrl;

	const currentLink = document.getElementById( elementId );

	if ( currentLink && currentLink.getAttribute( 'href' ) === cssUrl ) {
		return;
	}

	const newLink = await loadCSS( cssUrl, currentLink );

	if ( currentLink && currentLink.parentElement ) {
		currentLink.parentElement.removeChild( currentLink );
	}

	newLink.id = elementId;
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

function switchWebpackCSS( isRTL ) {
	const currentLinks = document.querySelectorAll( 'link[rel="stylesheet"][data-webpack]' );

	return map( currentLinks, async currentLink => {
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
 * @param {Element} currentLink an existing <link> DOM element before which we want to insert the new one
 * @returns {Promise<String>} the new <link> DOM element after the CSS has been loaded
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
