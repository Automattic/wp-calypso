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
import { siteLastBackupQuery } from 'calypso/dashboard/app/queries/site-backups';
import { siteCurrentPlanQuery } from 'calypso/dashboard/app/queries/site-plans';
import { sitePreviewLinksQuery } from 'calypso/dashboard/app/queries/site-preview-links';
import { siteScanQuery } from 'calypso/dashboard/app/queries/site-scan';
import { queryClient } from 'calypso/dashboard/app/query-client';
import { DotcomFeatures } from 'calypso/dashboard/data/constants';
import { canManageSite } from 'calypso/dashboard/sites/features';
import { hasHostingFeature } from 'calypso/dashboard/utils/site-features';
import Root from '../components/root';
import { getRouterOptions, createBrowserHistoryAndMemoryRouterSync } from '../utils/router';
import type { WPBreakpoint } from '@wordpress/compose/build-types/hooks/use-viewport-match';

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
	loader: async ( { params: { siteSlug }, preload } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( preload ) {
			Promise.all( [
				queryClient.ensureQueryData( siteCurrentPlanQuery( site.ID ) ),
				hasHostingFeature( site, DotcomFeatures.SCAN ) &&
					queryClient.ensureQueryData( siteScanQuery( site.ID ) ),
				hasHostingFeature( site, DotcomFeatures.BACKUPS ) &&
					queryClient.ensureQueryData( siteLastBackupQuery( site.ID ) ),
				site.is_a4a_dev_site && queryClient.ensureQueryData( sitePreviewLinksQuery( site.ID ) ),
			] );
		}
	},
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

const siteOverviewCompatibilityRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug',
	beforeLoad: ( { cause, params: { siteSlug } } ) => {
		if ( cause !== 'enter' ) {
			return;
		}
		throw redirect( { to: `/${ siteSlug }/overview`, replace: true } );
	},
} );

const siteSettingsCompatibilityRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug/settings',
	beforeLoad: ( { cause, params: { siteSlug } } ) => {
		if ( cause !== 'enter' ) {
			return;
		}
		throw redirect( { to: `/${ siteSlug }/settings`, replace: true } );
	},
} );

const siteSettingsWithFeatureCompatibilityRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug/settings/$feature',
	beforeLoad: ( { cause, params: { siteSlug, feature } } ) => {
		if ( cause !== 'enter' ) {
			return;
		}
		throw redirect( { to: `/${ siteSlug }/settings/${ feature }`, replace: true } );
	},
} );

const createRouteTree = () =>
	rootRoute.addChildren( [
		siteRoute.addChildren( [ siteOverviewRoute ] ),
		siteOverviewCompatibilityRoute,
		siteSettingsCompatibilityRoute,
		siteSettingsWithFeatureCompatibilityRoute,
	] );

const compatibilityRoutes = [
	siteOverviewCompatibilityRoute,
	siteSettingsCompatibilityRoute,
	siteSettingsWithFeatureCompatibilityRoute,
];

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
