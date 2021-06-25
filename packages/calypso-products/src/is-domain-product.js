/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { isDomainMapping } from './is-domain-mapping';
import { isDomainRegistration } from './is-domain-registration';

export function isDomainProduct( product ) {
	product = formatProduct( product );

	return isDomainMapping( product ) || isDomainRegistration( product );
}
