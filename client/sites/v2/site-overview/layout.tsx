import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { AnalyticsProvider, type AnalyticsClient } from 'calypso/dashboard/app/analytics';
import { AuthProvider } from 'calypso/dashboard/app/auth';
import router, {
	routerConfig,
	syncBrowserHistoryToRouter,
	syncMemoryRouterToBrowserHistory,
} from './router';
import type { Store } from 'redux';

function RouterProviderWithConfig( { siteSlug }: { siteSlug?: string } ) {
	useEffect( () => {
		syncBrowserHistoryToRouter( router );
	}, [ siteSlug ] );

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
}: {
	store: Store;
	analyticsClient: AnalyticsClient;
	siteSlug?: string;
} ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<AuthProvider>
				<AnalyticsProvider client={ analyticsClient }>
					<ReduxProvider store={ store }>
						<RouterProviderWithConfig siteSlug={ siteSlug } />
					</ReduxProvider>
				</AnalyticsProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default Layout;
