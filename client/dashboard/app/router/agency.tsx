import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { requireAgencyUser } from './a4a-guards';
import { rootRoute } from './root';

// Pathless layout route that applies the agency-only guard to every agency
// route. The routes share no URL prefix, so this groups them by access rule
// (not by path) and declares `requireAgencyUser` once instead of per route.
const agencyProtectedRoute = createRoute( {
	getParentRoute: () => rootRoute,
	id: 'agency-protected',
	beforeLoad: requireAgencyUser,
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
	getParentRoute: () => agencyProtectedRoute,
	path: 'overview',
} ).lazy( () =>
	import( '../../agency/overview' ).then( ( d ) =>
		createLazyRoute( 'agency-overview' )( {
			component: d.default,
		} )
	)
);

export const createAgencyRoutes = () => [
	agencyProtectedRoute.addChildren( [ agencyOverviewRoute ] ),
];
