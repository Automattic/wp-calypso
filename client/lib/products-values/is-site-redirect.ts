/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isSiteRedirect( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return product.product_slug === 'offsite_redirect';
}
