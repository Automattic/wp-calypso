/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { domainProductSlugs } from 'calypso/lib/domains/constants';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isDomainTransfer( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return product.product_slug === domainProductSlugs.TRANSFER_IN;
}
