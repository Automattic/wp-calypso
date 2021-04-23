/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackProductSlug } from 'calypso/lib/products-values/is-jetpack-product-slug';

export function isJetpackProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackProductSlug( product.product_slug );
}
