/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function isDomainRegistration( product ) {
	product = formatProduct( product );

	return !! product.is_domain_registration;
}
