import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { AnalyticsProvider, type AnalyticsClient } from 'calypso/dashboard/app/analytics';
import { AuthProvider, useAuth } from 'calypso/dashboard/app/auth';
import { queryClient } from 'calypso/dashboard/app/query-client';
import router, {
	routerConfig,
	syncBrowserHistoryToRouter,
	syncMemoryRouterToBrowserHistory,
} from './router';
import type { ParsedLocation } from '@tanstack/react-router';
import type { Store } from 'redux';

function RouterProviderWithAuth( { pathname }: { pathname: string } ) {
	const auth = useAuth();
	const previousLocationRef = useRef< ParsedLocation | undefined >();

	useEffect( () => {
		return router.subscribe( 'onBeforeLoad', ( { fromLocation } ) => {
			previousLocationRef.current = fromLocation;
		} );
	}, [] );

	useEffect( () => {
		syncBrowserHistoryToRouter( router );
	}, [ pathname ] );

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

	return (
		<RouterProvider
			router={ router }
			context={ { auth, config: routerConfig, previousLocationRef } }
		/>
	);
}

function Layout( {
	store,
	analyticsClient,
	pathname,
}: {
	store: Store;
	analyticsClient: AnalyticsClient;
	pathname: string;
} ) {
	return (
		<QueryClientProvider client={ queryClient }>
			<AuthProvider>
				<AnalyticsProvider client={ analyticsClient }>
					<ReduxProvider store={ store }>
						<RouterProviderWithAuth pathname={ pathname } />
					</ReduxProvider>
				</AnalyticsProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}

export default Layout;
