/**
 * Internal dependencies
 */
import { assertValidProduct } from 'lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'lib/products-values/format-product';
import { isDomainMapping } from 'lib/products-values/is-domain-mapping';
import { isDomainRegistration } from 'lib/products-values/is-domain-registration';

export function isDomainProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isDomainMapping( product ) || isDomainRegistration( product );
}
