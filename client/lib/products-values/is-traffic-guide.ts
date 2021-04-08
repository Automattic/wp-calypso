/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { WPCOM_TRAFFIC_GUIDE } from 'calypso/lib/products-values/constants';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isTrafficGuide( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return WPCOM_TRAFFIC_GUIDE === product.product_slug;
}
