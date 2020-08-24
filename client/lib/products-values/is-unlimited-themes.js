/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isUnlimitedThemes( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'unlimited_themes' === product.product_slug;
}
