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
import { isDefaultLocale, getLanguage } from './utils';

const debug = debugFactory( 'calypso:i18n' );

function languageFileUrl( localeSlug ) {
	const protocol = typeof window === 'undefined' ? 'https://' : '//'; // use a protocol-relative path in the browser

	return `${ protocol }widgets.wp.com/languages/calypso/${ localeSlug }.json`;
}

export default function switchLocale( localeSlug ) {
	if ( localeSlug === i18n.getLocaleSlug() ) {
		return;
	}

	if ( isDefaultLocale( localeSlug ) ) {
		i18n.configure( { defaultLocaleSlug: localeSlug } );
		return;
	}

	const language = getLanguage( localeSlug );
	if ( ! language ) {
		return;
	}

	// Note: i18n is a singleton that will be shared between all server requests!
	request.get( languageFileUrl( localeSlug ) ).end( function( error, response ) {
		if ( error ) {
			debug(
				'Encountered an error loading locale file for ' + localeSlug + '. Falling back to English.'
			);
			return;
		}

		i18n.setLocale( response.body );

		if ( typeof document !== 'undefined' ) {
			document.documentElement.lang = localeSlug;
			document.documentElement.dir = language.rtl ? 'rtl' : 'ltr';

			const directionFlag = language.rtl ? '-rtl' : '';
			const debugFlag = process.env.NODE_ENV === 'development' ? '-debug' : '';
			const cssUrl = window.app.staticUrls[ `style${ debugFlag }${ directionFlag }.css` ];

			switchCSS( 'main-css', cssUrl );
		}
	} );
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
