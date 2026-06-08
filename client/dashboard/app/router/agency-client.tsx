import { agencyQuery, queryClient } from '@automattic/api-queries';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';

/**
 * Guard for client-only routes. A4A agency users have no access to client
 * surfaces (subscriptions, etc.), so we bounce them to their agency area.
 *
 * Attach as a route's `beforeLoad`. The `agencyQuery` is already primed in the
 * root route's `beforeLoad` for A4A, so this resolves from cache.
 */
async function requireClientUser( { cause }: { cause: string } ) {
	// Hover/intent preloads shouldn't trigger redirects.
	if ( cause === 'preload' ) {
		return;
	}

	const agency = await queryClient.ensureQueryData( agencyQuery() );
	if ( ! agency.isClientUser ) {
		throw redirectAsNotAllowed( { to: '/overview' } );
	}
}

// `/client` – parent route for agency-client surfaces
const agencyClientParentRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'client',
	beforeLoad: requireClientUser,
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
