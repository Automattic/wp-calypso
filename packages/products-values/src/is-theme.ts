/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isTheme( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return 'premium_theme' === product.product_slug;
}
