/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { domainProductSlugs } from './plans-constants';

export function isDomainTransfer( product ) {
	product = snakeCase( product );

	return product.product_slug === domainProductSlugs.TRANSFER_IN;
}
