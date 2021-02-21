/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackBackupSlug } from 'calypso/lib/products-values/is-jetpack-backup-slug';

export function isJetpackBackup( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackBackupSlug( product.product_slug );
}
