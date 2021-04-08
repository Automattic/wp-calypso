/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isUnlimitedThemes( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return 'unlimited_themes' === product.product_slug;
}
