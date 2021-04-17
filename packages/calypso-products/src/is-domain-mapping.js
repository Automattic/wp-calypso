/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isDomainMapping( product ) {
	product = formatProduct( product );

	return product.product_slug === 'domain_map';
}
