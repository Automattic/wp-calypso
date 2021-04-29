/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function getDomain( product ) {
	product = formatProduct( product );
	return product.extra?.domain_to_bundle ?? product.meta;
}
