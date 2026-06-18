import { activeAgencyQuery, agencyQuery, queryClient } from '@automattic/api-queries';
import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { redirectAsNotAllowed } from './redirect';
import { rootRoute } from './root';

// Pathless layout route that guards every agency route (blocks client users).
const agencyRoute = createRoute( {
	getParentRoute: () => rootRoute,
	id: 'agency',
	beforeLoad: async ( { cause } ) => {
		if ( cause === 'preload' ) {
			return; // Don't redirect on hover/intent preloads.
		}

		const agency = await queryClient.ensureQueryData( agencyQuery() );
		if ( agency.isClientUser ) {
			throw redirectAsNotAllowed( { to: '/client/subscriptions' } );
		}
	},
} );

// `/overview` – agency overview
const agencyOverviewRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Agency Overview' ),
			},
		],
	} ),
	getParentRoute: () => agencyRoute,
	path: 'overview',
} ).lazy( () =>
	import( '../../agency/overview' ).then( ( d ) =>
		createLazyRoute( 'agency-overview' )( {
			component: d.default,
		} )
	)
);

// `/tiers` – agency tiers & benefits
const agencyTiersRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Tiers' ),
			},
		],
	} ),
	getParentRoute: () => agencyRoute,
	path: 'agency/tiers',
	loader: () => queryClient.ensureQueryData( activeAgencyQuery() ),
} ).lazy( () =>
	import( '../../agency/tiers' ).then( ( d ) =>
		createLazyRoute( 'agency-tiers' )( {
			component: d.default,
		} )
	)
);

// `/marketplace/exclusive-offers` – partner offers (Refer / Resell)
const exclusiveOffersRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Exclusive offers' ),
			},
		],
	} ),
	getParentRoute: () => agencyRoute,
	path: 'marketplace/exclusive-offers',
} ).lazy( () =>
	import( '../../agency/marketplace/exclusive-offers' ).then( ( d ) =>
		createLazyRoute( 'exclusive-offers' )( {
			component: d.default,
		} )
	)
);

export const createAgencyRoutes = () => [
	agencyRoute.addChildren( [ agencyOverviewRoute, agencyTiersRoute, exclusiveOffersRoute ] ),
];
