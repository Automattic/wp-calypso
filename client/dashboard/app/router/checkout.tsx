import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from './root';

export type CheckoutSearchParams = {
	/**
	 * Comma-separated product slug(s) to add to the cart on load.
	 * For example: `wordpress_com_personal` or `wordpress_com_personal,domain_map`
	 */
	productSlug?: string;
	/**
	 * Comma-separated meta value(s) parallel to `productSlug`.
	 * Used for products that require extra context, e.g. a domain name for
	 * domain mapping: `example.com`
	 */
	productMeta?: string;
	/**
	 * Comma-separated quantity value(s) parallel to `productSlug`.
	 * For example: `12` for a Google Workspace subscription with 12 seats.
	 */
	productQuantity?: string;
	/**
	 * Comma-separated subscription/purchase ID(s) parallel to `productSlug`.
	 * When present, the matching products are added as renewals.
	 */
	subscriptionId?: string;
	/**
	 * A coupon code to apply to the cart on load.
	 */
	coupon?: string;
};

export const checkoutRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/checkout/$siteSlug',
	component: lazyRouteComponent( () => import( '../../checkout/index-wrapper' ), 'default' ),
	validateSearch: ( search ): CheckoutSearchParams => ( {
		productSlug: typeof search.productSlug === 'string' ? search.productSlug : undefined,
		productMeta: typeof search.productMeta === 'string' ? search.productMeta : undefined,
		productQuantity:
			typeof search.productQuantity === 'string' ? search.productQuantity : undefined,
		subscriptionId: typeof search.subscriptionId === 'string' ? search.subscriptionId : undefined,
		coupon: typeof search.coupon === 'string' ? search.coupon : undefined,
	} ),
} );

const checkoutPendingRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: '/checkout/$siteSlug/pending/$orderId',
	component: lazyRouteComponent( () => import( '../../checkout/pending' ), 'default' ),
} );

/**
 * Creates checkout routes for the Dashboard
 */
export const createCheckoutRoutes = () => {
	return [ checkoutRoute, checkoutPendingRoute ];
};
