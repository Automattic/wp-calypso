/**
 * External dependencies
 */
import { JETPACK_BACKUP_PRODUCTS } from 'calypso/lib/products-values/constants';

export function isJetpackBackupSlug( productSlug: string ): boolean {
	return JETPACK_BACKUP_PRODUCTS.includes( productSlug );
}
