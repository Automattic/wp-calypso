/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function getDomain( product ) {
	product = formatProduct( product );

	const domainToBundle = product.extra?.domain_to_bundle;
	if ( domainToBundle ) {
		return domainToBundle;
	}

	return product.meta;
}
