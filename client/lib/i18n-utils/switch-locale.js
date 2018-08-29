/** @format */

/**
 * External dependencies
 */
import request from 'superagent';
import i18n from 'i18n-calypso';
import debugFactory from 'debug';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { isDefaultLocale, getLanguage, getLangRevision } from './utils';

const debug = debugFactory( 'calypso:i18n' );

function languageFileUrl( localeSlug ) {
	const protocol = typeof window === 'undefined' ? 'https://' : '//'; // use a protocol-relative path in the browser
	const revision = getLangRevision( localeSlug );
	const fileUrl = `${ protocol }widgets.wp.com/languages/calypso/${ localeSlug }.json`;

	return revision ? fileUrl + `?v=${ revision }` : fileUrl;
}

function setLocaleInDOM( localeSlug, isRTL ) {
	document.documentElement.lang = localeSlug;
	document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

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

export function switchCSS( elementId, cssUrl, callback = noop ) {
	if ( bundles.hasOwnProperty( elementId ) && bundles[ elementId ] === cssUrl ) {
		callback();

		return;
	}

	bundles[ elementId ] = cssUrl;

	const currentLink = document.getElementById( elementId );

	if ( currentLink && currentLink.getAttribute( 'href' ) === cssUrl ) {
		callback();

		return;
	}

	loadCSS( cssUrl, currentLink, ( error, newLink ) => {
		if ( currentLink && currentLink.parentElement ) {
			currentLink.parentElement.removeChild( currentLink );
		}

		newLink.id = elementId;

		callback();
	} );
}

/**
 * Loads a css stylesheet into the page.
 *
 * @param {string} cssUrl - a url to a css resource to be inserted into the page
 * @param {Element} currentLink - a <link> DOM element that we want to use as a reference for stylesheet order
 * @param {Function} callback - a callback function to be called when the CSS has been loaded (after 500ms have passed).
 */
function loadCSS( cssUrl, currentLink, callback = noop ) {
	const link = Object.assign( document.createElement( 'link' ), {
		rel: 'stylesheet',
		type: 'text/css',
		href: cssUrl,
	} );

	const onload = () => {
		if ( 'onload' in link ) {
			link.onload = null;
		}

		callback( null, link );
	};

	if ( 'onload' in link ) {
		link.onload = onload;
	} else {
		setTimeout( onload, 500 );
	}

	document.head.insertBefore( link, currentLink ? currentLink.nextSibling : null );
}
