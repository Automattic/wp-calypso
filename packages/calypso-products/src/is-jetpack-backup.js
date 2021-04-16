/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { isJetpackBackupSlug } from './is-jetpack-backup-slug';

export function isJetpackBackup( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackBackupSlug( product.product_slug );
}
