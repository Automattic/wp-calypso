import { domainProductSlugs } from './constants';
import { formatProduct } from './format-product';

export function isDomainTransfer( product ) {
	product = formatProduct( product );

	return product.product_slug === domainProductSlugs.TRANSFER_IN;
}
