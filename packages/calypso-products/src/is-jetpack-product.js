/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { isJetpackProductSlug } from './is-jetpack-product-slug';

export function isJetpackProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackProductSlug( product.product_slug );
}
