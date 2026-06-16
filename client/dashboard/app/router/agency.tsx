import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { requireAgencyUser } from './a4a-guards';
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
	beforeLoad: requireAgencyUser,
} ).lazy( () =>
	import( '../../agency/overview' ).then( ( d ) =>
		createLazyRoute( 'agency-overview' )( {
			component: d.default,
		} )
	)
);

export const createAgencyRoutes = () => [ agencyOverviewRoute ];
