/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isDomainRedemption( product ) {
	product = snakeCase( product );

	return product.product_slug === 'domain_redemption';
}
