/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { map, noop } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { switchCSS } from 'lib/i18n-utils/switch-locale';
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
			context.layout = (
				<LayoutComponent
					store={ store }
					primary={ primary }
					secondary={ secondary }
					redirectUri={ context.originalUrl }
				/>
			);
		}
		next();
	};
}

export function setSection( section ) {
	return ( context, next = noop ) => {
		context.store.dispatch( setSectionAction( section ) );

		loadSectionCSS( context, next );
	};
}

function loadSectionCSS( context, next ) {
	const section = getSection( context.store.getState() );

	if ( section.css && typeof document !== 'undefined' ) {
		const url = isRTL( context.store.getState() ) ? section.css.urls.rtl : section.css.urls.ltr;

		switchCSS( 'section-css-' + section.css.id, url, next );

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
	}

	context.store.dispatch( setLocale( context.lang || config( 'i18n_default_locale_slug' ) ) );

	loadSectionCSS( context, next );
}

// Creates valid locale options for routes containing locale slugs
// Defining this here so it can be used by both ./index.node.js and ./index.web.js
// We cannot export it from either of those (to import it from the other) because of
// the way that `server/bundler/loader` expects only a default export and nothing else.
export const langRouteParams = `:lang(${ map( config( 'languages' ), 'langSlug' ).join( '|' ) })?`;
