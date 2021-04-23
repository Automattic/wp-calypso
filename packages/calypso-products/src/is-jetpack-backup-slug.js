/**
 * External dependencies
 */
import { JETPACK_BACKUP_PRODUCTS } from './jetpack-constants';

export function isJetpackBackupSlug( productSlug ) {
	return JETPACK_BACKUP_PRODUCTS.includes( productSlug );
}
