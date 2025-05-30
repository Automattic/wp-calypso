import {
	initializeAnalytics,
	recordTracksEvent,
	recordTracksPageViewWithPageParams,
} from '@automattic/calypso-analytics';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useMemo, useEffect } from 'react';
import { AnalyticsProvider, type AnalyticsClient } from './analytics';
import { AuthProvider, useAuth } from './auth';
import { AppProvider, type AppConfig } from './context';
import { I18nProvider } from './i18n';
import { queryClient } from './query-client';
import { getRouter } from './router';

function RouterProviderWithAuth( { config }: { config: AppConfig } ) {
	const auth = useAuth();
	const router = useMemo( () => getRouter( config ), [ config ] );
	return <RouterProvider router={ router } context={ { auth, config } } />;
}

function AnalyticsProviderWithAuth( { children }: { children: React.ReactNode } ) {
	const { user } = useAuth();
	useEffect( () => {
		if ( user ) {
			initializeAnalytics( user, null );
		}
	}, [ user ] );

	const analyticsClient: AnalyticsClient = useMemo(
		() => ( {
			recordTracksEvent( eventName, properties ) {
				recordTracksEvent( eventName, properties );
			},
			recordPageView( url, title ) {
				recordTracksPageViewWithPageParams( url, { title } );
			},
		} ),
		[]
	);

	return <AnalyticsProvider client={ analyticsClient }>{ children }</AnalyticsProvider>;
}

function Layout( { config }: { config: AppConfig } ) {
	return (
		<AppProvider config={ config }>
			<QueryClientProvider client={ queryClient }>
				<AuthProvider>
					<I18nProvider>
						<AnalyticsProviderWithAuth>
							<RouterProviderWithAuth config={ config } />
						</AnalyticsProviderWithAuth>
					</I18nProvider>
				</AuthProvider>
			</QueryClientProvider>
		</AppProvider>
	);
}
export default Layout;
