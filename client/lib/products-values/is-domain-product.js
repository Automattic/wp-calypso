/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isDomainMapping } from 'calypso/lib/products-values/is-domain-mapping';
import { isDomainRegistration } from 'calypso/lib/products-values/is-domain-registration';

export function isDomainProduct( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isDomainMapping( product ) || isDomainRegistration( product );
}
