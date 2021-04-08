/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isFreeWordPressComDomain( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return product.is_free === true;
}
