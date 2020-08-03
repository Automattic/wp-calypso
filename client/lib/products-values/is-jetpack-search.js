/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';
import { isJetpackSearchSlug } from 'lib/products-values/is-jetpack-search-slug';

export function isJetpackSearch( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isJetpackSearchSlug( product.product_slug );
}
