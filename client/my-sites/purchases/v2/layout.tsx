import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect } from 'react';
import { AnalyticsProvider, type AnalyticsClient } from 'calypso/dashboard/app/analytics';
import { AuthProvider } from 'calypso/dashboard/app/auth';
import { AppProvider } from 'calypso/dashboard/app/context';
import { PageHeaderOverrideProvider } from 'calypso/dashboard/components/page-header';
import { PageSubNavProvider } from 'calypso/dashboard/components/page-layout';
import router, {
	routerConfig,
	syncBrowserHistoryToRouter,
	syncMemoryRouterToBrowserHistory,
} from './router';

function RouterProviderWithConfig( { path }: { path?: string } ) {
	useEffect( () => {
		syncBrowserHistoryToRouter( router );
	}, [ path ] );

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
	analyticsClient,
	header,
	path,
	subNav,
}: {
	analyticsClient: AnalyticsClient;
	header?: { title: React.ReactNode; description?: React.ReactNode };
	path?: string;
	subNav?: React.ReactNode;
} ) {
	const content = (
		<PageSubNavProvider subNav={ subNav }>
			<RouterProviderWithConfig path={ path } />
		</PageSubNavProvider>
	);

	return (
		<AppProvider config={ routerConfig }>
			<QueryClientProvider client={ queryClient }>
				<AuthProvider>
					<AnalyticsProvider client={ analyticsClient }>
						{ header ? (
							<PageHeaderOverrideProvider { ...header }>{ content }</PageHeaderOverrideProvider>
						) : (
							content
						) }
					</AnalyticsProvider>
				</AuthProvider>
			</QueryClientProvider>
		</AppProvider>
	);
}

export default Layout;
