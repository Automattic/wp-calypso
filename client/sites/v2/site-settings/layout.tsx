import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { AnalyticsProvider, type AnalyticsClient } from 'calypso/dashboard/app/analytics';
import { AuthProvider } from 'calypso/dashboard/app/auth';
import {
	AppProvider,
	APP_CONTEXT_DEFAULT_CONFIG,
	type AppConfig,
} from 'calypso/dashboard/app/context';
import router, {
	routerConfig,
	syncBrowserHistoryToRouter,
	syncMemoryRouterToBrowserHistory,
} from './router';
import type { Store } from 'redux';

function RouterProviderWithConfig( {
	siteSlug,
	feature,
}: {
	siteSlug?: string;
	feature?: string;
} ) {
	useEffect( () => {
		syncBrowserHistoryToRouter( router );
	}, [ siteSlug, feature ] );

	useEffect( () => {
		const handlePopstate = () => {
			syncBrowserHistoryToRouter( router );
		};

		const unsubscribe = syncMemoryRouterToBrowserHistory( router );
		window.addEventListener( 'popstate', handlePopstate );

		return () => {
			unsubscribe();
			window.removeEventListener( 'popstate', handlePopstate );
		};
	}, [] );

	return <RouterProvider router={ router } context={ { config: routerConfig } } />;
}

function Layout( {
	store,
	analyticsClient,
	siteSlug,
	feature,
}: {
	store: Store;
	analyticsClient: AnalyticsClient;
	siteSlug?: string;
	feature?: string;
} ) {
	const APP_CONFIG = {
		...APP_CONTEXT_DEFAULT_CONFIG,
		supports: {
			sites: {
				settings: {
					general: {
						redirect: true,
					},
					server: true,
					security: true,
					experimental: true,
				},
			},
		},
	};

	return (
		<AppProvider config={ APP_CONFIG as AppConfig }>
			<QueryClientProvider client={ queryClient }>
				<AuthProvider>
					<AnalyticsProvider client={ analyticsClient }>
						<ReduxProvider store={ store }>
							<RouterProviderWithConfig siteSlug={ siteSlug } feature={ feature } />
						</ReduxProvider>
					</AnalyticsProvider>
				</AuthProvider>
			</QueryClientProvider>
		</AppProvider>
	);
}

export default Layout;
