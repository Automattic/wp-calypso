/** @format */
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

export function setSection( section ) {
	return ( context, next = noop ) => {
		context.store.dispatch( setSectionAction( section ) );

		next();
	};
}

export function setUpLocale( context, next ) {
	const { lang } = context.params;
	const language = getLanguage( lang );

	if ( language ) {
		context.lang = lang;
		context.isRTL = Boolean( language.rtl );
	} else {
		context.lang = config( 'i18n_default_locale_slug' );
		context.isRTL = Boolean( config( 'rtl' ) );
	}

	next();
}
