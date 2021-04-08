/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackBackupSlug } from 'calypso/lib/products-values/is-jetpack-backup-slug';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isJetpackBackup( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isJetpackBackupSlug( product.product_slug );
}
