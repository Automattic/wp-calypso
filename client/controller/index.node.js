/**
 * External dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import { makeLayoutMiddleware } from './shared.js';
import LayoutLoggedOut from 'calypso/layout/logged-out';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { RouteProvider } from 'calypso/components/route';

/**
 * Re-export
 */
export { setSectionMiddleware, setLocaleMiddleware } from './shared.js';

const ProviderWrappedLoggedOutLayout = ( {
	store,
	currentSection,
	currentRoute,
	currentQuery,
	primary,
	secondary,
	redirectUri,
} ) => (
	<CalypsoI18nProvider>
		<RouteProvider
			currentSection={ currentSection }
			currentRoute={ currentRoute }
			currentQuery={ currentQuery }
		>
			<ReduxProvider store={ store }>
				<LayoutLoggedOut primary={ primary } secondary={ secondary } redirectUri={ redirectUri } />
			</ReduxProvider>
		</RouteProvider>
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
