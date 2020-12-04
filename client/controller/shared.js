/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { setSection } from 'calypso/state/ui/actions';
import { setLocale } from 'calypso/state/ui/language/actions';
import { isTranslatedIncompletely } from 'calypso/lib/i18n-utils/utils';

export function makeLayoutMiddleware( LayoutComponent ) {
	return ( context, next ) => {
		const { store, section, pathname, query, primary, secondary } = context;

		// On server, only render LoggedOutLayout when logged-out.
		if ( ! context.isServerSide || ! getCurrentUser( context.store.getState() ) ) {
			context.layout = (
				<LayoutComponent
					store={ store }
					currentSection={ section }
					currentRoute={ pathname }
					currentQuery={ query }
					primary={ primary }
					secondary={ secondary }
					redirectUri={ context.originalUrl }
				/>
			);
		}
		next();
	};
}

export function setSectionMiddleware( section ) {
	return ( context, next = noop ) => {
		// save the section in context
		context.section = section;

		// save the section to Redux, too (poised to become legacy)
		context.store.dispatch( setSection( section ) );
		next();
	};
}

export function setLocaleMiddleware( context, next ) {
	const currentUser = getCurrentUser( context.store.getState() );

	if ( context.params.lang ) {
		context.lang = context.params.lang;
	} else if ( currentUser ) {
		const shouldFallbackToDefaultLocale =
			currentUser.use_fallback_for_incomplete_languages &&
			isTranslatedIncompletely( currentUser.localeSlug );

		context.lang = shouldFallbackToDefaultLocale
			? config( 'i18n_default_locale_slug' )
			: currentUser.localeSlug;
	}

	context.store.dispatch( setLocale( context.lang || config( 'i18n_default_locale_slug' ) ) );
	next();
}
