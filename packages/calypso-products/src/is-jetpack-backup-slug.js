/**
 * External dependencies
 */
import { JETPACK_BACKUP_PRODUCTS } from './constants';

export function isJetpackBackupSlug( productSlug ) {
	return JETPACK_BACKUP_PRODUCTS.includes( productSlug );
}
