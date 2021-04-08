/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isDomainRedemption( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return product.product_slug === 'domain_redemption';
}
