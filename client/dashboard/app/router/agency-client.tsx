import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { requireClientUser } from './a4a-guards';
import { rootRoute } from './root';

// `/client` – parent route for agency-client surfaces
const agencyClientRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'client',
	beforeLoad: requireClientUser,
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
