/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isNoAds( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return 'no-adverts/no-adverts.php' === product.product_slug;
}
