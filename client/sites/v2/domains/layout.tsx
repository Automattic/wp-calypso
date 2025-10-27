import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect } from 'react';
import { AnalyticsProvider, type AnalyticsClient } from 'calypso/dashboard/app/analytics';
import { AuthProvider, useAuth } from 'calypso/dashboard/app/auth';
import router, {
	routerConfig,
	syncBrowserHistoryToRouter,
	syncMemoryRouterToBrowserHistory,
} from './router';

function RouterProviderWithAuth() {
	const auth = useAuth();

	useEffect( () => {
		syncBrowserHistoryToRouter( router );
	}, [] );

	useEffect( () => {
		const unsubscribe = syncMemoryRouterToBrowserHistory( router );

		const handlePopstate = () => {
			syncBrowserHistoryToRouter( router );
		};

		window.addEventListener( 'popstate', handlePopstate );

		return () => {
			unsubscribe();
			window.removeEventListener( 'popstate', handlePopstate );
		};
	}, [] );

	return <RouterProvider router={ router } context={ { auth, config: routerConfig } } />;
}

export default function DomainLayout( { analyticsClient }: { analyticsClient: AnalyticsClient } ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<AuthProvider>
				<AnalyticsProvider client={ analyticsClient }>
					<RouterProviderWithAuth />
				</AnalyticsProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}
