import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from './root';

/**
 * Creates checkout routes for the Dashboard
 */
export const createCheckoutRoutes = () => {
	const checkoutRoute = createRoute( {
		getParentRoute: () => rootRoute,
		path: '/checkout/$siteSlug',
		component: lazyRouteComponent( () => import( '../../checkout/index-wrapper' ), 'default' ),
	} );

	return [ checkoutRoute ];
};
