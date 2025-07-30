import page from '@automattic/calypso-router';
import { Outlet, createRootRoute, createRoute } from '@tanstack/react-router';
import { siteBySlugQuery } from 'calypso/dashboard/app/queries/site';
import { queryClient } from 'calypso/dashboard/app/query-client';
import { canManageSite } from 'calypso/dashboard/sites/features';
import Root from './components/root';

/**
 * Define general routes
 */
export const rootRoute = createRootRoute( { component: Root } );

export const dashboardSitesCompatibilityRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites',
	beforeLoad: ( { cause } ) => {
		if ( cause !== 'enter' ) {
			return;
		}
		page.replace( '/sites' );
	},
} );

export const siteRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug',
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! canManageSite( site ) ) {
			page.redirect( '/sites' );
		}
	},
	component: () => <Outlet />,
} );
