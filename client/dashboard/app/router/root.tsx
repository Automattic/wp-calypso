import { agencyQuery, jetpackSiteUrlsQuery, queryClient } from '@automattic/api-queries';
import { createRootRouteWithContext } from '@tanstack/react-router';
import Root from '../root';
import NotFoundRoot from '../root/error';
import { dashboardRedirect } from './redirect';
import type { AppConfig } from '../context';

export type RootRouterContext = {
	config: AppConfig;
};

export const rootRoute = createRootRouteWithContext< RootRouterContext >()( {
	component: Root,
	notFoundComponent: NotFoundRoot,
	beforeLoad: async ( { cause, context, location } ) => {
		if ( cause === 'preload' ) {
			return;
		}

		if ( cause === 'enter' ) {
			// We are priming the query cache with Jetpack URLs so we can detect "site collisions" (i.e. two sites have the same slug)
			queryClient.prefetchQuery( jetpackSiteUrlsQuery() );
		}

		// For agency-enabled dashboards, load the agency data and guard agency
		// routes: users who are neither an agency nor an agency client are sent
		// to signup. This keeps the agency query a pure data fetch.
		if ( context.config.supports.agency ) {
			const isSignupPath =
				location.pathname === '/signup' || location.pathname.startsWith( '/signup/' );
			if ( ! isSignupPath ) {
				const agency = await queryClient.ensureQueryData( agencyQuery() );
				if ( ! agency.isClientUser && ! agency.hasAgency ) {
					throw dashboardRedirect( { href: '/signup', replace: true } );
				}
			}
		}
	},
} );
