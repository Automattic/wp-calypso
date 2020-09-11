/**
 * External dependencies
 */
import { JETPACK_SCAN_PRODUCTS } from 'lib/products-values/constants';

export function isJetpackScanSlug( productSlug ) {
	return JETPACK_SCAN_PRODUCTS.includes( productSlug );
}
