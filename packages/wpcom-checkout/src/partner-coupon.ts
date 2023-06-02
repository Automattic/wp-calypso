import { getSublabel } from './checkout-labels';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Get Partner Coupon
 *
 * This method uses some of the same detection logic as partnerCouponRedirects in
 * the Connection controller, and future improvements should probably unify the two
 * code bases to "generic utility functions".
 */
export function getPartnerCoupon( {
	coupon,
	products,
}: {
	coupon: string;
	products?: ResponseCartProduct[];
} ): boolean {
	const productHasSublabel =
		products && products.some( ( product: ResponseCartProduct ) => !! getSublabel( product ) );
	const isPartnerCoupon = coupon.startsWith( 'IONOS_' );

	return ( productHasSublabel && isPartnerCoupon ) || false;
}
