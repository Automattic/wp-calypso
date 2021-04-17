/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isDomainRedemption( product ) {
	product = formatProduct( product );

	return product.product_slug === 'domain_redemption';
}
