import { siteBySlugQuery } from '@automattic/api-queries';
import calypsoConfig from '@automattic/calypso-config';
import { WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { useQuery } from '@tanstack/react-query';
import { createLazyRoute, createRoute, createRouter } from '@tanstack/react-router';
import { APP_CONTEXT_DEFAULT_CONFIG } from 'calypso/dashboard/app/context';
import { handleOnCatch } from 'calypso/dashboard/app/logger';
import * as appRouterSites from 'calypso/dashboard/app/router/sites';
import { hasJetpackCriticalError } from 'calypso/dashboard/sites/site/notices';
import CriticalErrorOverview from 'calypso/sites/overview/components/critical-error';
import { rootRoute, dashboardSitesCompatibilityRoute, siteRoute } from '../router';
import siteSettingsRouter from '../site-settings/router';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';
import type { WPBreakpoint } from '@wordpress/compose/build-types/hooks/use-viewport-match';
import type { AppConfig } from 'calypso/dashboard/app/context';
import type { ErrorInfo } from 'react';

const siteOverviewRoute = createRoute( {
	...appRouterSites.siteOverviewRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/overview' ).then( ( d ) =>
		createLazyRoute( 'overview' )( {
			component: function SiteOverview() {
				const siteSlug = siteRoute.useParams().siteSlug;
				const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );
				const isWide = useBreakpoint( WIDE_BREAKPOINT );

				if ( site?.__inaccessible_jetpack_error && hasJetpackCriticalError( site ) ) {
					return <CriticalErrorOverview siteSlug={ siteSlug } />;
				}

				const breakpoints = isWide
					? { large: 'wide' as WPBreakpoint, small: 'wide' as WPBreakpoint }
					: { large: 'medium' as WPBreakpoint, small: 'medium' as WPBreakpoint };
				return <d.default siteSlug={ siteSlug } breakpoints={ breakpoints } />;
			},
		} )
	)
);

const siteSettingsWithFeaturePreloadRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug/settings/$feature',
	loader: async ( { params: { siteSlug, feature } } ) => {
		siteSettingsRouter.preloadRoute( {
			to: `/sites/${ siteSlug }/settings/${ feature }`,
		} );
	},
} );

const createRouteTree = () =>
	rootRoute.addChildren( [
		siteRoute.addChildren( [ siteOverviewRoute, siteSettingsWithFeaturePreloadRoute ] ),
		dashboardSitesCompatibilityRoute,
	] );

export const { syncBrowserHistoryToRouter, syncMemoryRouterToBrowserHistory } =
	createBrowserHistoryAndMemoryRouterSync();

export const getRouter = ( config: AppConfig ) => {
	const routeTree = createRouteTree();
	const router = createRouter( {
		...getRouterOptions( config ),
		routeTree,
		defaultOnCatch: ( error: Error, errorInfo: ErrorInfo ) => {
			handleOnCatch( error, errorInfo, router, {
				severity: calypsoConfig( 'env_id' ) === 'production' ? 'error' : 'debug',
				dashboard_backport: true,
			} );
		},
	} );

	return router;
};

export const routerConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	basePath: '/',
};

export default getRouter( routerConfig );
