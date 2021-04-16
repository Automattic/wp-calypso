/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { domainProductSlugs } from './constants';

export function isDomainTransfer( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === domainProductSlugs.TRANSFER_IN;
}
