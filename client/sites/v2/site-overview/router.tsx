import page from '@automattic/calypso-router';
import { WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import {
	Outlet,
	createLazyRoute,
	createRootRoute,
	createRoute,
	createRouter,
	redirect,
} from '@tanstack/react-router';
import { siteBySlugQuery } from 'calypso/dashboard/app/queries/site';
import { queryClient } from 'calypso/dashboard/app/query-client';
import { canManageSite } from 'calypso/dashboard/sites/features';
import Root from '../components/root';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';

const rootRoute = createRootRoute( { component: Root } );

const siteRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '$siteSlug',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! canManageSite( site ) ) {
			page.redirect( '/sites' );
		}
	},
	component: () => <Outlet />,
} );

const siteOverviewRoute = createRoute( {
	getParentRoute: () => siteRoute,
	path: '/',
} ).lazy( () =>
	import( 'calypso/dashboard/sites/overview' ).then( ( d ) =>
		createLazyRoute( 'overview' )( {
			component: function SiteOverview() {
				const isWide = useBreakpoint( WIDE_BREAKPOINT );
				const breakpoints = isWide
					? { large: 'huge', small: 'huge' }
					: { large: 'large', small: 'large' };
				return (
					<d.default
						siteSlug={ siteRoute.useParams().siteSlug }
						hideSitePreview
						breakpoints={ breakpoints as any }
					/>
				);
			},
		} )
	)
);

const sitesOverviewCompatibilityRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/sites/$siteSlug',
	beforeLoad: ( { cause, params: { siteSlug } } ) => {
		if ( cause !== 'enter' ) {
			return;
		}
		throw redirect( { to: `/overview/${ siteSlug }`, replace: true } );
	},
} );

const createRouteTree = () =>
	rootRoute.addChildren( [
		siteRoute.addChildren( [ siteOverviewRoute ] ),
		sitesOverviewCompatibilityRoute,
	] );

const compatibilityRoutes = [ sitesOverviewCompatibilityRoute ];

export const { syncBrowserHistoryToRouter, syncMemoryRouterToBrowserHistory } =
	createBrowserHistoryAndMemoryRouterSync( { compatibilityRoutes } );

export const getRouter = ( { basePath }: { basePath: string } ) => {
	const routeTree = createRouteTree();
	const router = createRouter( {
		...getRouterOptions(),
		routeTree,
		basepath: basePath,
	} );

	return router;
};
