/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isFreeWordPressComDomain( product ) {
	product = formatProduct( product );
	return product.is_free === true;
}
