/**
 * External dependencies
 */
import { JETPACK_SCAN_PRODUCTS } from 'calypso/lib/plans/constants';

export function isJetpackScanSlug( productSlug ) {
	return JETPACK_SCAN_PRODUCTS.includes( productSlug );
}
