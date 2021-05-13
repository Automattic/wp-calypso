/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { domainProductSlugs } from './constants';

export function isDomainTransfer( product ) {
	product = formatProduct( product );

	return product.product_slug === domainProductSlugs.TRANSFER_IN;
}
