/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { isJetpackScanSlug } from './is-jetpack-scan-slug';

export function isJetpackScan( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackScanSlug( product.product_slug );
}
