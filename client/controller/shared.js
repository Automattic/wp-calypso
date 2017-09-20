/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';

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

function loadCSS( cssUrl, elementId = null ) {
	if ( typeof document === 'undefined' ) {
		return;
	}

	let link;
	if ( elementId ) {
		link = document.getElementById( elementId );
	}

	if ( link ) {
		link.href = cssUrl;
	} else {
		link = document.createElement( 'link' );
		link.setAttribute( 'rel', 'stylesheet' );
		link.setAttribute( 'type', 'text/css' );
		link.setAttribute( 'href', cssUrl );
		if ( elementId ) {
			link.setAttribute( 'id', elementId );
		}
		document.getElementsByTagName( 'head' )[ 0 ].appendChild( link );
	}
}

export function setSection( section ) {
	return ( context, next = noop ) => {
		context.store.dispatch( setSectionAction( section ) );

		loadSectionCSS( context, next );
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

export function setUpLocale( context, next ) {
	const currentUser = getCurrentUser( context.store.getState() );

	// the lang query parameter has to have a higher priority than the user defined language
	// because the server might use it to set the rtl version of the global stylesheet (style-rtl.css).
	if ( context.params.lang ) {
		context.lang = context.params.lang;
		context.isRTL = Boolean( getLanguage( context.lang ).rtl );
	} else if ( currentUser ) {
		context.lang = currentUser.localeSlug;
		context.isRTL = isUserRtl( context.store.getState() );
	} else {
		context.lang = context.lang || config( 'i18n_default_locale_slug' );
		context.isRTL = context.isRTL || Boolean( config( 'rtl' ) );
	}

	loadSectionCSS( context, next );
}
