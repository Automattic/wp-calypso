/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { isJetpackScanSlug } from './is-jetpack-scan-slug';

export function isJetpackScan( product ) {
	product = formatProduct( product );

	return isJetpackScanSlug( product.product_slug );
}
