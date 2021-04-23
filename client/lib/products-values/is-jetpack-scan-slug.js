/**
 * External dependencies
 */
import { JETPACK_SCAN_PRODUCTS } from '@automattic/calypso-products';

export function isJetpackScanSlug( productSlug ) {
	return JETPACK_SCAN_PRODUCTS.includes( productSlug );
}
