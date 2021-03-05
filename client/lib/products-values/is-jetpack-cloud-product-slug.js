/**
 * External dependencies
 */
import {
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
} from 'calypso/lib/products-values/constants';

export function isJetpackCloudProductSlug( productSlug ) {
	return (
		JETPACK_SCAN_PRODUCTS.includes( productSlug ) || JETPACK_BACKUP_PRODUCTS.includes( productSlug )
	);
}
