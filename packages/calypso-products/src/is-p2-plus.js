/**
 * Internal dependencies
 */
import { isP2PlusPlan } from './main';
import { formatProduct } from './format-product';

export function isP2Plus( product ) {
	product = formatProduct( product );

	return isP2PlusPlan( product.product_slug );
}
