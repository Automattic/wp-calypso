/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';
import { isJetpackScanSlug } from 'lib/products-values/is-jetpack-scan-slug';

export function isJetpackScan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackScanSlug( product.product_slug );
}
