/**
 * External dependencies
 */
import React from 'react';
import { noop, find } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { getCurrentUser } from 'state/current-user/selectors';
import { getLanguage } from 'lib/i18n-utils';
import { setSection as setSectionAction } from 'state/ui/actions';
import { getSection } from 'state/ui/selectors';
import isUserRtl from 'state/selectors/is-rtl';

export function makeLayoutMiddleware( LayoutComponent ) {
	return ( context, next ) => {
		const { store, primary, secondary } = context;

		// On server, only render LoggedOutLayout when logged-out.
		if ( ! context.isServerSide || ! getCurrentUser( context.store.getState() ) ) {
			let redirectUri;
			if ( context.isServerSide ) {
				redirectUri = `${ context.protocol }://${ context.host }${ context.originalUrl }`;
			}
			context.layout = (
				<LayoutComponent
					store={ store }
					primary={ primary }
					secondary={ secondary }
					redirectUri={ redirectUri }
				/>
			);
		}
		next();
	};
}

/***
 * Replaces stylesheet element gracefully
 *
 * If we set the `href` attribute of `link` directly, the browser will remove
 * the previous stylesheet and will start loading the new one, but in the meantime
 * we won't have all of the sizes the old one had.
 *
 * To prevent that, we first load a new stylesheet and then remove the old one
 *
 * @param {DOMElement} linkElement Link to change
 * @param {String} newHref new url to load
 */
function replaceStlyesheet( linkElement, newHref ) {
	const newLink = Object.assign( document.createElement( 'link' ), {
		rel: 'stylesheet',
		type: 'text/css',
		href: newHref,
	} );

	if ( linkElement.id ) {
		newLink.id = linkElement.id;
	}

	function deleteOldLink() {
		linkElement.parentElement.removeChild( linkElement );
		newLink.removeEventListener( 'load', deleteOldLink );
	}

	newLink.addEventListener( 'load', deleteOldLink );

	linkElement.parentElement.appendChild( newLink );
}

function loadCSS( cssUrl, elementId = null ) {
	if ( typeof document === 'undefined' ) {
		return;
	}

	if ( elementId ) {
		const link = document.getElementById( elementId );

		if ( link.getAttribute( 'href' ) !== cssUrl ) {
			replaceStlyesheet( link, cssUrl );
		}
	} else {
		const link = Object.assign( document.createElement( 'link' ), {
			rel: 'stylesheet',
			type: 'text/css',
			href: cssUrl,
			... elementId && { id: elementId }
		} );

		document.head.appendChild( link );
	}
}

export function setSection( section ) {
	return ( context, next = noop ) => {
		context.store.dispatch( setSectionAction( section ) );

		next();
	};
}

export function loadSectionCSS( context, next ) {
	const section = getSection( context.store.getState() );

	if ( section.cssUrls ) {
		const cssUrl = context.isRTL ? section.cssUrls.rtl : section.cssUrls.ltr;
		loadCSS( cssUrl, 'section-css' );
	}

	next();
}

function fixRtlStyles() {
	const htmlElement = document.querySelectorAll( 'html' )[ 0 ];

	// this will be already set to rtl if SSR properly rendered
	if ( htmlElement.dir === 'rtl' ) {
		return;
	}

	const linkElements = Array.prototype.slice.apply( document.querySelectorAll( 'link[rel=stylesheet]' ) );
	// can be style.css and style-debug.css
	const mainStyleLink = find( linkElements, el => el.href.match( /style[^.]+\.css/ ) );
	const mainStyleLinkHash = mainStyleLink.href.match( /\?v=([A-F0-9]+)$/i )[ 1 ];
	const rtlStyleHref = mainStyleLink.href.split( '/' )
		.slice( 0, -1 )
		.concat( [ 'style-rtl.css?v=' + mainStyleLinkHash ] )
		.join( '/' );

	replaceStlyesheet( mainStyleLink, rtlStyleHref );

	htmlElement.dir = 'rtl';
}

export function setUpLocale( context, next ) {
	const currentUser = getCurrentUser( context.store.getState() );

	if ( context.params.lang ) {
		context.lang = context.params.lang;
		context.isRTL = Boolean( getLanguage( context.lang ).rtl );
	} else if ( currentUser ) {
		context.lang = currentUser.localeSlug;
		context.isRTL = isUserRtl( context.store.getState() );

		if ( context.isRTL && ! config( 'rtl' ) ) {
			fixRtlStyles();
		}
	} else {
		context.lang = context.lang || config( 'i18n_default_locale_slug' );
		context.isRTL = context.isRTL || Boolean( config( 'rtl' ) );
	}

	loadSectionCSS( context, next );
}
