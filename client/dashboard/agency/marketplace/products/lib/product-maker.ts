import { getVendorInfo } from './vendor-info';

type ProductMaker = 'woo' | 'jetpack' | 'neutral';

// Woo and Jetpack have their own colours; every other maker takes the neutral set.
export function getProductMaker( slug: string ): ProductMaker {
	const vendor = getVendorInfo( slug )?.vendorSlug;
	if ( vendor === 'woocommerce' ) {
		return 'woo';
	}
	return vendor === 'jetpack' ? 'jetpack' : 'neutral';
}
