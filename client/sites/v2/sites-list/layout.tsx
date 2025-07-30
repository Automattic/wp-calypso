import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect } from 'react';
import { AnalyticsProvider, type AnalyticsClient } from 'calypso/dashboard/app/analytics';
import { AuthProvider, useAuth } from 'calypso/dashboard/app/auth';
import { queryClient } from 'calypso/dashboard/app/query-client';
import { getRouter, syncBrowserHistoryToRouter, syncMemoryRouterToBrowserHistory } from './router';

// Serves a similar purpose to AppConfig form v2 dashboard.
const config = {
	basePath: '/',
};

export const router = getRouter( config );

function RouterProviderWithAuth( { siteSlug }: { siteSlug?: string } ) {
	const auth = useAuth();

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

	return <RouterProvider router={ router } context={ { auth, config } } />;
}

function Layout( {
	analyticsClient,
	siteSlug,
}: {
	analyticsClient: AnalyticsClient;
	siteSlug?: string;
} ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<AuthProvider>
				<AnalyticsProvider client={ analyticsClient }>
					<RouterProviderWithAuth siteSlug={ siteSlug } />
				</AnalyticsProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default Layout;
