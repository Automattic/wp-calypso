/** @format */

/**
 * External dependencies
 */
import request from 'superagent';
import i18n from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { isDefaultLocale, getLanguage } from './utils';

const debug = debugFactory( 'calypso:i18n' );

function languageFileUrl( localeSlug ) {
	const protocol = typeof window === 'undefined' ? 'https://' : '//'; // use a protocol-relative path in the browser

	return `${ protocol }widgets.wp.com/languages/calypso/${ localeSlug }.json`;
}

function setLocaleInDOM( localeSlug, isRTL ) {
	document.documentElement.lang = localeSlug;
	document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
	document.body.classList[ isRTL ? 'add' : 'remove' ]( 'rtl' );

	const directionFlag = isRTL ? '-rtl' : '';
	const debugFlag = process.env.NODE_ENV === 'development' ? '-debug' : '';
	const cssUrl = window.app.staticUrls[ `style${ debugFlag }${ directionFlag }.css` ];

	switchCSS( 'main-css', cssUrl );
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
		request.get( languageFileUrl( targetLocaleSlug ) ).end( function( error, response ) {
			if ( error ) {
				debug(
					'Encountered an error loading locale file for ' +
						localeSlug +
						'. Falling back to English.'
				);
				return;
			}

			// Handle race condition when we're requested to switch to a different
			// locale while we're in the middle of request, we should abondon result
			if ( targetLocaleSlug !== lastRequestedLocale ) {
				return;
			}

			i18n.setLocale( response.body );

			setLocaleInDOM( domLocaleSlug, !! language.rtl );
		} );
	}
}

const bundles = {};

export async function switchCSS( elementId, cssUrl ) {
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
