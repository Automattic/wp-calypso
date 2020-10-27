/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isDomainRegistration } from 'calypso/lib/products-values/is-domain-registration';
import { isDomainMapping } from 'calypso/lib/products-values/is-domain-mapping';

export function getDomainProductRanking( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	if ( isDomainRegistration( product ) ) {
		return 0;
	} else if ( isDomainMapping( product ) ) {
		return 1;
	}
}
