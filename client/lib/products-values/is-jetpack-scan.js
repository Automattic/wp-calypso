/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackScanSlug } from 'calypso/lib/products-values/is-jetpack-scan-slug';

export function isJetpackScan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackScanSlug( product.product_slug );
}
