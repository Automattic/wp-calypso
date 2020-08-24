/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';
import { isJetpackBackupSlug } from 'lib/products-values/is-jetpack-backup-slug';

export function isJetpackBackup( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackBackupSlug( product.product_slug );
}
