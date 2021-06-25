/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { isDomainRegistration } from './is-domain-registration';
import { isDomainMapping } from './is-domain-mapping';

export function getDomainProductRanking( product ) {
	product = formatProduct( product );

	if ( isDomainRegistration( product ) ) {
		return 0;
	} else if ( isDomainMapping( product ) ) {
		return 1;
	}
}
