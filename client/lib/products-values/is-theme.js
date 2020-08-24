/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isTheme( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return 'premium_theme' === product.product_slug;
}
