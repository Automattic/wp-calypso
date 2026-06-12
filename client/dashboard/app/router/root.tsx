import {
	agencyQuery,
	rawUserPreferencesQuery,
	jetpackSiteUrlsQuery,
	queryClient,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { createRootRouteWithContext } from '@tanstack/react-router';
import { wpcomLink } from '../../utils/link';
import { AUTH_QUERY_KEY } from '../auth';
import Root from '../root';
import NotFoundRoot from '../root/error';
import { dashboardRedirect } from './redirect';
import type { AppConfig } from '../context';
import type { User } from '@automattic/api-core';

const OLDEST_ELIGIBLE_USER: number = config( 'dashboard_opt_in_oldest_eligible_user' ); // Cut-off on 22 December 2025

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

		if ( ! context.config.optIn ) {
			return;
		}

		const user = queryClient.getQueryData< User >( AUTH_QUERY_KEY );
		if ( user && user.ID <= OLDEST_ELIGIBLE_USER ) {
			return;
		}

		const userPreference = await queryClient.ensureQueryData( rawUserPreferencesQuery() );
		const optIn = userPreference[ 'hosting-dashboard-opt-in' ];
		const isDashboardEnrolled =
			optIn?.value === 'opt-in' ||
			optIn?.value === 'forced-opt-in' ||
			config.isEnabled( 'dashboard/forced-opt-in' );
		if ( isDashboardEnrolled ) {
			return;
		}

		throw dashboardRedirect( { href: wpcomLink( '/' ), replace: true } );
	},
} );
