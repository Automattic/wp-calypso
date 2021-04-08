/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { TITAN_MAIL_MONTHLY_SLUG } from 'calypso/lib/titan/constants';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isTitanMail( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return product.product_slug === TITAN_MAIL_MONTHLY_SLUG;
}
