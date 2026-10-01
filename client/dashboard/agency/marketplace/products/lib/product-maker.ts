import { getVendorInfo } from './vendor-info';

export type ProductMaker = 'woo' | 'jetpack' | 'neutral';

/**
 * The maker whose colours a product's tile, drawing and showcase field take:
 * Woo and Jetpack have their own; every other maker (Stripe, PayPal, Klarna,
 * Pressable…) takes the neutral set.
 */
export function getProductMaker( slug: string ): ProductMaker {
	const vendor = getVendorInfo( slug )?.vendorSlug;
	if ( vendor === 'woocommerce' ) {
		return 'woo';
	}
	return vendor === 'jetpack' ? 'jetpack' : 'neutral';
}
