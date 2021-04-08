/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isJetpackAntiSpamSlug } from 'calypso/lib/products-values/is-jetpack-anti-spam-slug';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isJetpackAntiSpam( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isJetpackAntiSpamSlug( product.product_slug );
}
