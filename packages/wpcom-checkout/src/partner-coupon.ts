import { getSublabel } from './checkout-labels';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

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
