/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function getDomain( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	const domainToBundle = product.extra?.domain_to_bundle;
	if ( domainToBundle ) {
		return domainToBundle;
	}

	return product.meta;
}
