import { queryClient } from '@automattic/api-queries';
import {
	initializeAnalytics,
	recordTracksEvent, // eslint-disable-line no-restricted-imports
	recordTracksPageViewWithPageParams, // eslint-disable-line no-restricted-imports
} from '@automattic/calypso-analytics';
import { GlobalChartsProvider } from '@automattic/charts';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, type AnyRouter } from '@tanstack/react-router';
import { useEnableWpCompatOverlaySlot } from '@wordpress/ui';
import { useMemo, useEffect, useState } from 'react';
import { withColorScheme } from 'calypso/lib/color-scheme/with-color-scheme';
import { AnalyticsProvider, type AnalyticsClient } from './analytics';
import { getNormalizedPath, getSuperProps } from './analytics/super-props';
import { AuthProvider, useAuth } from './auth';
import { dashboardChartTheme } from './chart-theme';
import { AppProvider, useAppContext } from './context';
import { I18nProvider } from './i18n';
import { getRouter } from './router';
import { useSurvicate, useSurvicateVisitTraits } from './survicate';
import type { AppConfig } from './context';

function AnalyticsProviderWithClient( {
	children,
	router,
}: {
	children: React.ReactNode;
	router: AnyRouter;
} ) {
	const { user } = useAuth();
	const { unifiedAdminPageViewApp: app } = useAppContext();

	useEffect( () => {
		if ( user ) {
			initializeAnalytics( user, getSuperProps( user, router, queryClient ) );
		}
	}, [ user, router ] );

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

	useEffect( () => {
		if ( ! app ) {
			return;
		}

		const recordUnifiedPageView = () => {
			analyticsClient.recordTracksEvent( 'wpcom_unified_admin_page_view', {
				source: 'msd',
				app,
				path: router.history.location.pathname,
				route: getNormalizedPath( router.state.matches, router.basepath ),
			} );
		};
		const unsubscribe = router.subscribe( 'onResolved', ( { pathChanged } ) => {
			if ( pathChanged ) {
				recordUnifiedPageView();
			}
		} );

		if ( router.state.status === 'idle' && router.state.matches.length ) {
			recordUnifiedPageView();
		}

		return unsubscribe;
	}, [ router, app, analyticsClient ] );

	useSurvicate();
	useSurvicateVisitTraits();

	return <AnalyticsProvider client={ analyticsClient }>{ children }</AnalyticsProvider>;
}

/**
 * In development, TanStack Router's `Transitioner` only loads the first router
 * it mounts with. When a hot update re-runs the router modules, Fast Refresh
 * recreates the router, and the new one would never load and render nothing.
 * Keying `RouterProvider` with this remounts it, so the new router loads.
 */
function useRouterKey( router: AnyRouter ) {
	const [ current, setCurrent ] = useState( { router, key: 0 } );
	if ( current.router !== router ) {
		setCurrent( { router, key: current.key + 1 } );
	}
	return current.key;
}

function Layout( { config }: { config: AppConfig } ) {
	useEnableWpCompatOverlaySlot();
	const router = useMemo( () => getRouter( config ), [ config ] );
	const routerKey = useRouterKey( router );

	return (
		<AppProvider config={ config }>
			<QueryClientProvider client={ queryClient }>
				<AuthProvider>
					<I18nProvider>
						<AnalyticsProviderWithClient router={ router }>
							<GlobalChartsProvider theme={ dashboardChartTheme }>
								{ withColorScheme(
									<RouterProvider key={ routerKey } router={ router } context={ { config } } />,
									{
										enabled: config.supports.colorScheme,
									}
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
