import { agencyQuery, queryClient } from '@automattic/api-queries';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';

// `/client` – parent route for agency-client surfaces
const agencyClientParentRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'client',
	// Block A4A agency users from client-only routes. `agencyQuery` is primed by
	// the root route's `beforeLoad`, so this resolves from cache.
	beforeLoad: async ( { cause } ) => {
		// Preloads (hover/intent) shouldn't trigger redirects.
		if ( cause === 'preload' ) {
			return;
		}

		const agency = await queryClient.ensureQueryData( agencyQuery() );
		if ( ! agency.isClientUser ) {
			throw redirectAsNotAllowed( { to: '/overview' } );
		}
	},
} );

// `/client/subscriptions` – agency client subscriptions overview
const agencyClientSubscriptionsRoute = createRoute( {
	getParentRoute: () => agencyClientParentRoute,
	path: 'subscriptions',
} ).lazy( () =>
	import( '../../agency-client/subscriptions' ).then( ( d ) =>
		createLazyRoute( 'agency-client-subscriptions' )( {
			component: d.default,
		} )
	)
);

export const createAgencyClientRoutes = () => [
	agencyClientParentRoute,
	agencyClientSubscriptionsRoute,
];
