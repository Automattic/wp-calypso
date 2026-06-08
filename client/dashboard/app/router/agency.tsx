import { agencyQuery, queryClient } from '@automattic/api-queries';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';

/**
 * Guard for agency-only routes. A4A client users have no access to agency
 * surfaces (overview, etc.), so we bounce them to their own client area.
 *
 * Attach as a route's `beforeLoad`. The `agencyQuery` is already primed in the
 * root route's `beforeLoad` for A4A, so this resolves from cache.
 */
async function requireAgencyUser( { cause }: { cause: string } ) {
	// Hover/intent preloads shouldn't trigger redirects.
	if ( cause === 'preload' ) {
		return;
	}

	const agency = await queryClient.ensureQueryData( agencyQuery() );
	if ( agency.isClientUser ) {
		throw redirectAsNotAllowed( { to: '/client/subscriptions' } );
	}
}

// `/overview` – agency overview
const agencyOverviewRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Agency Overview' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'overview',
	beforeLoad: requireAgencyUser,
} ).lazy( () =>
	import( '../../agency/overview' ).then( ( d ) =>
		createLazyRoute( 'agency-overview' )( {
			component: d.default,
		} )
	)
);

export const createAgencyRoutes = () => [ agencyOverviewRoute ];
