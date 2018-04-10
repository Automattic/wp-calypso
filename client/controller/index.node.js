/** @format */

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

/**
 * Re-export
 */
export { setSection, setUpLocale } from './shared.js';

export const ReduxWrappedLoggedOutLayout = ( { store, primary, secondary, redirectUri } ) => (
	<ReduxProvider store={ store }>
		<LayoutLoggedOut primary={ primary } secondary={ secondary } redirectUri={ redirectUri } />
	</ReduxProvider>
);

/**
 * @param { object } context -- Middleware context
 * @param { function } next -- Call next middleware in chain
 *
 * Produce a `LayoutLoggedOut` element in `context.layout`, using
 * `context.primary` and `context.secondary` to populate it.
 */
export const makeLayout = makeLayoutMiddleware( ReduxWrappedLoggedOutLayout );

export function redirectLoggedIn( { isLoggedIn, res }, next ) {
	// TODO: Make it work also for development env
	if ( isLoggedIn ) {
		res.redirect( '/' );
		return;
	}

	next();
}
