import { queryClient } from '@automattic/api-queries';
// eslint-disable-next-line no-restricted-imports
import {
	initializeAnalytics,
	recordTracksEvent,
	recordTracksPageViewWithPageParams,
} from '@automattic/calypso-analytics';
import { GlobalChartsProvider } from '@automattic/charts';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, type AnyRouter } from '@tanstack/react-router';
import { useMemo, useEffect } from 'react';
import { AnalyticsProvider, type AnalyticsClient } from './analytics';
import { getNormalizedPath, getSuperProps } from './analytics/super-props';
import { AuthProvider, useAuth } from './auth';
import { dashboardChartTheme } from './chart-theme';
import { ColorSchemeProvider } from './color-scheme';
import { AppProvider, useAppContext } from './context';
import { I18nProvider } from './i18n';
import { getRouter } from './router';
import { useSurvicate } from './survicate';
import type { AppConfig } from './context';

function AnalyticsProviderWithClient( {
	children,
	router,
}: {
	children: React.ReactNode;
	router: AnyRouter;
} ) {
	const { user } = useAuth();
	const { posthog } = useAppContext();

	useEffect( () => {
		if ( user ) {
			initializeAnalytics( user, getSuperProps( user, router, queryClient ) );
		}
	}, [ user, router ] );

	useEffect( () => {
		if ( posthog ) {
			import( '@automattic/posthog' ).then( ( { init } ) =>
				init( posthog.apiKey, user ? { ID: user.ID } : undefined, posthog.overrides )
			);
		}
	}, [ user, posthog ] );

	const analyticsClient: AnalyticsClient = useMemo(
		() => ( {
			recordTracksEvent( eventName, properties ) {
				const path = getNormalizedPath( router.state.matches, router.basepath );
				recordTracksEvent( eventName, {
					path,
					...properties,
				} );
			},

			// The title property is used by Google Analytics not Tracks. The hosting
			// dashboard doesn't use Google Analytics for now.
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			recordPageView( url, _title ) {
				recordTracksPageViewWithPageParams( url, {
					device_type: resolveDeviceTypeByViewPort(),
				} );
			},
		} ),
		[ router ]
	);

	useSurvicate();

	return <AnalyticsProvider client={ analyticsClient }>{ children }</AnalyticsProvider>;
}

function Layout( { config }: { config: AppConfig } ) {
	const router = useMemo( () => getRouter( config ), [ config ] );

	return (
		<AppProvider config={ config }>
			<QueryClientProvider client={ queryClient }>
				<AuthProvider>
					<I18nProvider>
						<AnalyticsProviderWithClient router={ router }>
							<GlobalChartsProvider theme={ dashboardChartTheme }>
								{ config.supports.colorScheme ? (
									<ColorSchemeProvider>
										<RouterProvider router={ router } context={ { config } } />
									</ColorSchemeProvider>
								) : (
									<RouterProvider router={ router } context={ { config } } />
								) }
							</GlobalChartsProvider>
						</AnalyticsProviderWithClient>
					</I18nProvider>
				</AuthProvider>
			</QueryClientProvider>
		</AppProvider>
	);
}
export default Layout;
