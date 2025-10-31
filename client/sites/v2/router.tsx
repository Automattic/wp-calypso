import { siteBySlugQuery, queryClient } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Outlet, createRootRouteWithContext, createRoute } from '@tanstack/react-router';
import { canManageSite } from 'calypso/dashboard/sites/features';
import { getSiteDisplayName } from 'calypso/dashboard/utils/site-name';
import { hasSiteTrialEnded } from 'calypso/dashboard/utils/site-trial';
import Root from './components/root';
import type { Site } from '@automattic/api-core';
import type { RootRouterContext } from 'calypso/dashboard/app/router/root';

/**
 * Define general routes
 */
export const rootRoute = createRootRouteWithContext< RootRouterContext >()( { component: Root } );

export const dashboardSitesCompatibilityRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'sites',
	beforeLoad: ( { cause } ) => {
		if ( cause !== 'enter' ) {
			return;
		}

		// Do the redirection only when the path is fully matched.
		if ( location.pathname === '/sites' ) {
			page.replace( '/sites' );
		}
	},
} );

export const siteRoute = createRoute( {
	head: ( { loaderData }: { loaderData?: { site: Site } } ) => ( {
		meta: [
			{
				title: loaderData && getSiteDisplayName( loaderData.site ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'sites/$siteSlug',
	beforeLoad: async ( { cause, params: { siteSlug }, location } ) => {
		if ( cause !== 'enter' ) {
			return;
		}

		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		const trialExpiredUrl = `/plans/my-plan/trial-expired/${ siteSlug }`;
		if ( hasSiteTrialEnded( site ) && ! location.pathname.includes( trialExpiredUrl ) ) {
			page.replace( trialExpiredUrl );
		}
	},
	loader: async ( { params: { siteSlug } } ) => {
		const site = await queryClient.ensureQueryData( siteBySlugQuery( siteSlug ) );
		if ( ! canManageSite( site ) ) {
			page.redirect( '/sites' );
		}

		return { site };
	},
	component: () => <Outlet />,
} );
