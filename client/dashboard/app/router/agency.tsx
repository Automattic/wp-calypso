import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
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
} ).lazy( () =>
	import( '../../agency/overview' ).then( ( d ) =>
		createLazyRoute( 'agency-overview' )( {
			component: d.default,
		} )
	)
);

// `/client` – parent route for agency-client surfaces (internal: agency-client)
const agencyClientParentRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'client',
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

export const createAgencyRoutes = () => [
	agencyOverviewRoute,
	agencyClientParentRoute,
	agencyClientSubscriptionsRoute,
];
