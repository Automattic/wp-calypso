/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isDomainMapping( product ) {
	product = snakeCase( product );

	return product.product_slug === 'domain_map';
}
