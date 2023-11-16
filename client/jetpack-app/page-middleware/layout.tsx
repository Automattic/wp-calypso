import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { RouteProvider } from 'calypso/components/route';
import { CalypsoReactQueryDevtools } from 'calypso/lib/react-query-devtools-helper';
import type { Callback } from 'page';
import type { FunctionComponent } from 'react';
import type { Store } from 'redux';

export { render, hydrate } from 'calypso/controller/web-util';

interface ProviderWrappedLayoutProps {
	store: Store;
	queryClient: QueryClient;
	currentRoute: string;
	currentQuery: object;
	primary: React.ReactNode;
	redirectUri: string;
}

export const ProviderWrappedLayout: FunctionComponent< ProviderWrappedLayoutProps > = ( {
	store,
	queryClient,
	currentRoute,
	currentQuery,
	primary,
} ) => {
	return (
		<CalypsoI18nProvider>
			{ /* TS incorrectly infers RouteProvider types; ignore errors here. */ }
			{ /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */ }
			{ /* @ts-ignore */ }
			<RouteProvider currentRoute={ currentRoute } currentQuery={ currentQuery }>
				<QueryClientProvider client={ queryClient }>
					<ReduxProvider store={ store }>{ primary }</ReduxProvider>
					<CalypsoReactQueryDevtools />
				</QueryClientProvider>
			</RouteProvider>
		</CalypsoI18nProvider>
	);
};

export function makeJetpackAppLayoutMiddleware(
	LayoutComponent: typeof ProviderWrappedLayout
): Callback {
	return ( context, next ) => {
		const { store, queryClient, pathname, query, primary } = context;

		context.layout = (
			<LayoutComponent
				store={ store }
				queryClient={ queryClient }
				currentRoute={ pathname }
				currentQuery={ query }
				primary={ primary }
				redirectUri={ context.originalUrl }
			/>
		);
		next();
	};
}

export const makeJetpackAppLayout = makeJetpackAppLayoutMiddleware( ProviderWrappedLayout );
