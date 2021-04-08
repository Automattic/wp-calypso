/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isConciergeSession( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return 'concierge-session' === product.product_slug;
}
