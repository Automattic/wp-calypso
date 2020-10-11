/**
 * External dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import { makeLayoutMiddleware } from './shared.js';
import LayoutLoggedOut from 'layout/logged-out';
import CalypsoI18nProvider from 'components/calypso-i18n-provider';

/**
 * Re-export
 */
export { setSectionMiddleware, setLocaleMiddleware } from './shared.js';

const ProviderWrappedLoggedOutLayout = ( { store, primary, secondary, redirectUri } ) => (
	<CalypsoI18nProvider>
		<ReduxProvider store={ store }>
			<LayoutLoggedOut primary={ primary } secondary={ secondary } redirectUri={ redirectUri } />
		</ReduxProvider>
	</CalypsoI18nProvider>
);

/**
 * @param { object } context -- Middleware context
 * @param {Function} next -- Call next middleware in chain
 *
 * Produce a `LayoutLoggedOut` element in `context.layout`, using
 * `context.primary` and `context.secondary` to populate it.
 */
export const makeLayout = makeLayoutMiddleware( ProviderWrappedLoggedOutLayout );

export function redirectLoggedIn( { isLoggedIn, res }, next ) {
	// TODO: Make it work also for development env
	if ( isLoggedIn ) {
		res.redirect( '/' );
		return;
	}

	next();
}
