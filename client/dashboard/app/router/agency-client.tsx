import { agencyQuery, queryClient } from '@automattic/api-queries';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';

// `/client` – parent route that guards every agency-client route (blocks agency users).
const agencyClientRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'client',
	beforeLoad: async ( { cause } ) => {
		if ( cause === 'preload' ) {
			return; // Don't redirect on hover/intent preloads.
		}

		const agency = await queryClient.ensureQueryData( agencyQuery() );
		if ( ! agency.isClientUser ) {
			throw redirectAsNotAllowed( { to: '/overview' } );
		}
	},
} );

// `/client/subscriptions` – agency client subscriptions overview
const agencyClientSubscriptionsRoute = createRoute( {
	getParentRoute: () => agencyClientRoute,
	path: 'subscriptions',
} ).lazy( () =>
	import( '../../agency-client/subscriptions' ).then( ( d ) =>
		createLazyRoute( 'agency-client-subscriptions' )( {
			component: d.default,
		} )
	)
);

export const createAgencyClientRoutes = () => [ agencyClientRoute, agencyClientSubscriptionsRoute ];
