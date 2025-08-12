import { WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { createLazyRoute, createRoute, createRouter } from '@tanstack/react-router';
import * as appRouter from 'calypso/dashboard/app/router';
import { rootRoute, dashboardSitesCompatibilityRoute, siteRoute } from '../router';
import siteSettingsRouter from '../site-settings/router';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';
import type { WPBreakpoint } from '@wordpress/compose/build-types/hooks/use-viewport-match';

const siteOverviewRoute = createRoute( {
	...appRouter.siteOverviewRoute.options,
	getParentRoute: () => siteRoute,
} ).lazy( () =>
	import( 'calypso/dashboard/sites/overview' ).then( ( d ) =>
		createLazyRoute( 'overview' )( {
			component: function SiteOverview() {
				const isWide = useBreakpoint( WIDE_BREAKPOINT );
				const breakpoints = isWide
					? { large: 'wide' as WPBreakpoint, small: 'wide' as WPBreakpoint }
					: { large: 'medium' as WPBreakpoint, small: 'medium' as WPBreakpoint };
				return (
					<d.default
						siteSlug={ siteRoute.useParams().siteSlug }
						hideSitePreview
						breakpoints={ breakpoints }
					/>
				);
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

export const getRouter = ( { basePath }: { basePath: string } ) => {
	const routeTree = createRouteTree();
	const router = createRouter( {
		...getRouterOptions(),
		routeTree,
		basepath: basePath,
	} );

	return router;
};

export const routerConfig = {
	basePath: '/',
};

export default getRouter( routerConfig );
