import { createRoute, createLazyRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

export const overviewRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'overview',
} ).lazy( () =>
	import( '../../agency-overview' ).then( ( d ) =>
		createLazyRoute( 'agency-overview' )( {
			component: d.default,
		} )
	)
);

export const createOverviewRoutes = () => {
	return [ overviewRoute ];
};
