/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { isJetpackBackupSlug } from './is-jetpack-backup-slug';

export function isJetpackBackup( product ) {
	product = formatProduct( product );

	return isJetpackBackupSlug( product.product_slug );
}
