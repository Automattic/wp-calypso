/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isDomainMapping( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === 'domain_map';
}
