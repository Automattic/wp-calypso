import { WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { createLazyRoute, createRoute, createRouter } from '@tanstack/react-router';
import * as appRouter from 'calypso/dashboard/app/router';
import { rootRoute, dashboardSitesCompatibilityRoute, siteRoute } from '../router';
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
					? { large: 'huge' as WPBreakpoint, small: 'huge' as WPBreakpoint }
					: { large: 'large' as WPBreakpoint, small: 'large' as WPBreakpoint };
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

const siteSettingsPreloadRoute = createRoute( {
	...appRouter.siteSettingsRoute.options,
	getParentRoute: () => siteRoute,
} );

const siteSettingsSiteVisibilityPreloadRoute = createRoute( {
	...appRouter.siteSettingsSiteVisibilityRoute.options,
	getParentRoute: () => siteRoute,
} );

const createRouteTree = () =>
	rootRoute.addChildren( [
		siteRoute.addChildren( [
			siteOverviewRoute,
			siteSettingsPreloadRoute,
			siteSettingsSiteVisibilityPreloadRoute,
		] ),
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
