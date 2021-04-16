/**
 * External dependencies
 */
import { JETPACK_SCAN_PRODUCTS } from './index';

export function isJetpackScanSlug( productSlug ) {
	return JETPACK_SCAN_PRODUCTS.includes( productSlug );
}
