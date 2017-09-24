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
		if ( link.getAttribute( 'href' ) !== cssUrl ) {
			link.href = cssUrl;
		}
		return;
	}

	link = Object.assign( document.createElement( 'link' ), {
		rel: 'stylesheet',
		type: 'text/css',
		href: cssUrl,
		... elementId && { id: elementId }
	} );

	document.head.appendChild( link );
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

export function setUpLocale( context, next ) {
	const currentUser = getCurrentUser( context.store.getState() );

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
