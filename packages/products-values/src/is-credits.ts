/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isCredits( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return 'wordpress-com-credits' === product.product_slug;
}
