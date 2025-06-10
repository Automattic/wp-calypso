import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AnalyticsProvider, type AnalyticsClient } from 'calypso/dashboard/app/analytics';
import { AuthProvider, useAuth } from 'calypso/dashboard/app/auth';
import { queryClient } from 'calypso/dashboard/app/query-client';
import { getRouter } from './router';

// Serves a similar purpose to AppConfig form v2 dashboard.
const config = {
	basePath: '/sites/settings/v2',
};

function RouterProviderWithAuth() {
	const auth = useAuth();
	const router = getRouter( config );
	return <RouterProvider router={ router } context={ { auth, config } } />;
}

function Layout( { analyticsClient }: { analyticsClient: AnalyticsClient } ) {
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

export default Layout;
