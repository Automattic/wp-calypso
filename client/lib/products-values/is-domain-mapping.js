/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';

export function isDomainMapping( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'domain_map';
}
