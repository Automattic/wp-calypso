/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { isJetpackProductSlug } from './is-jetpack-product-slug';

export function isJetpackProduct( product ) {
	product = formatProduct( product );

	return isJetpackProductSlug( product.product_slug );
}
