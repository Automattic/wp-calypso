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
import { setSection as setSectionAction } from 'state/ui/actions';
import { getSection } from 'state/ui/selectors';
import { setLocale } from 'state/ui/language/actions';
import isRTL from 'state/selectors/is-rtl';

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

/**
 * Loads a css stylesheet into the page
 * @param {string} cssUrl - a url to a css resource to be inserted into the page
 * @param {Function} callback - a callback function to be called when the CSS has been loaded (after 500ms have passed).
 */
function loadCSS( cssUrl, callback = noop ) {
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

	document.head.appendChild( link );
}

export function setSection( section ) {
	return ( context, next = noop ) => {
		context.store.dispatch( setSectionAction( section ) );

		loadSectionCSS( context, next );
	};
}

export function loadSectionCSS( context, next ) {
	const section = getSection( context.store.getState() );

	if ( section.cssUrls && typeof document !== 'undefined' ) {
		const cssUrl = isRTL( context.store.getState() ) ? section.cssUrls.rtl : section.cssUrls.ltr;

		// TODO: handle adding styles in `state.documentHead.meta` instead (currently only supports setting all meta at once)
		const currentLink = document.getElementById( 'section-css' );
		if ( currentLink.getAttribute( 'href' ) === cssUrl ) {
			return next();
		}

		loadCSS( cssUrl, ( err, newLink ) => {
			if ( currentLink && currentLink.parentElement ) {
				currentLink.parentElement.removeChild( currentLink );
			}

			newLink.id = 'section-css';

			next();
		} );

		return;
	}

	next();
}

export function setUpLocale( context, next ) {
	const currentUser = getCurrentUser( context.store.getState() );

	if ( context.params.lang ) {
		context.lang = context.params.lang;
	} else if ( currentUser ) {
		context.lang = currentUser.localeSlug;
	} else {
		context.lang = config( 'i18n_default_locale_slug' );
	}

	context.store.dispatch( setLocale( context.lang ) );

	loadSectionCSS( context, next );
}
