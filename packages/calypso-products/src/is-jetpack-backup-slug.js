/**
 * External dependencies
 */
import { JETPACK_BACKUP_PRODUCTS } from './index';

export function isJetpackBackupSlug( productSlug ) {
	return JETPACK_BACKUP_PRODUCTS.includes( productSlug );
}
