/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';
import { domainProductSlugs } from 'lib/domains/constants';

export function isDomainTransfer( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === domainProductSlugs.TRANSFER_IN;
}
