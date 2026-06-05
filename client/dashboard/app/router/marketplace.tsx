import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { rootRoute } from './root';

// `/exclusive-offers` – partner offers (Refer / Resell)
const exclusiveOffersRoute = createRoute( {
	head: () => ( {
		meta: [
			{
				title: __( 'Exclusive offers' ),
			},
		],
	} ),
	getParentRoute: () => rootRoute,
	path: 'exclusive-offers',
} ).lazy( () =>
	import( '../../marketplace/exclusive-offers' ).then( ( d ) =>
		createLazyRoute( 'exclusive-offers' )( {
			component: d.default,
		} )
	)
);

export const createMarketplaceRoutes = () => [ exclusiveOffersRoute ];
