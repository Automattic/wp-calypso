/**
 * External dependencies
 */
import { QueryClientProvider } from '@tanstack/react-query';
import React, { createElement } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import MomentProvider from 'calypso/components/localized-moment/provider';
import { RouteProvider } from 'calypso/components/route';
/**
 * Internal dependencies
 */
import ReauthRequired from './component';
import ReauthLayout from './layout';

export function reauthRequired( context, next ) {
	context.primary = createElement( ReauthRequired );
	next();
}

// Custom layout middleware factory for the reauth page
export function makeReauthLayout( context, next ) {
	const { i18n, store, queryClient, section, pathname, query, primary } = context;

	if ( context.cachedMarkup ) {
		return next();
	}

	// Wrap the simple layout in necessary context providers using JSX
	context.layout = (
		<CalypsoI18nProvider i18n={ i18n }>
			<RouteProvider currentSection={ section } currentRoute={ pathname } currentQuery={ query }>
				<QueryClientProvider client={ queryClient }>
					<ReduxProvider store={ store }>
						<MomentProvider>
							<ReauthLayout primary={ primary } />
						</MomentProvider>
					</ReduxProvider>
				</QueryClientProvider>
			</RouteProvider>
		</CalypsoI18nProvider>
	);

	next();
}
