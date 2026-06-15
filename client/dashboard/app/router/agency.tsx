import { agencyQuery, queryClient } from '@automattic/api-queries';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';

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
	// Block A4A client users from agency-only routes. `agencyQuery` is primed by
	// the root route's `beforeLoad`, so this resolves from cache.
	beforeLoad: async ( { cause } ) => {
		// Preloads (hover/intent) shouldn't trigger redirects.
		if ( cause === 'preload' ) {
			return;
		}

		const agency = await queryClient.ensureQueryData( agencyQuery() );
		if ( agency.isClientUser ) {
			throw redirectAsNotAllowed( { to: '/client/subscriptions' } );
		}
	},
} ).lazy( () =>
	import( '../../agency/overview' ).then( ( d ) =>
		createLazyRoute( 'agency-overview' )( {
			component: d.default,
		} )
	)
);

export const createAgencyRoutes = () => [ agencyOverviewRoute ];
