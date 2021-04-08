/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackScanSlug } from 'calypso/lib/products-values/is-jetpack-scan-slug';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isJetpackScan( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isJetpackScanSlug( product.product_slug );
}
