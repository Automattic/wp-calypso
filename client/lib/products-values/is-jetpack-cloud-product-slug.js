/**
 * External dependencies
 */
import { JETPACK_BACKUP_PRODUCTS, JETPACK_SCAN_PRODUCTS } from '@automattic/calypso-products';

export function isJetpackCloudProductSlug( productSlug ) {
	return (
		JETPACK_SCAN_PRODUCTS.includes( productSlug ) || JETPACK_BACKUP_PRODUCTS.includes( productSlug )
	);
}
