import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { RouteProvider } from 'calypso/components/route';
import { CalypsoReactQueryDevtools } from 'calypso/lib/react-query-devtools-helper';

export { render, hydrate } from 'calypso/controller/web-util';

export const ProviderWrappedLayout = ( {
	store,
	queryClient,
	currentSection,
	currentRoute,
	currentQuery,
	primary,
} ) => {
	return (
		<CalypsoI18nProvider>
			<RouteProvider
				currentSection={ currentSection }
				currentRoute={ currentRoute }
				currentQuery={ currentQuery }
			>
				<QueryClientProvider client={ queryClient }>
					<ReduxProvider store={ store }>{ primary }</ReduxProvider>
					<CalypsoReactQueryDevtools />
				</QueryClientProvider>
			</RouteProvider>
		</CalypsoI18nProvider>
	);
};

export function makeJetpackAppLayoutMiddleware( LayoutComponent ) {
	return ( context, next ) => {
		const { i18n, store, queryClient, section, pathname, query, primary } = context;

		context.layout = (
			<LayoutComponent
				i18n={ i18n }
				store={ store }
				queryClient={ queryClient }
				currentSection={ section }
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
