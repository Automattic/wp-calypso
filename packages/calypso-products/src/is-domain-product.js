/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { isDomainMapping } from './is-domain-mapping';
import { isDomainRegistration } from './is-domain-registration';

export function isDomainProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isDomainMapping( product ) || isDomainRegistration( product );
}
