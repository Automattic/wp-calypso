/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';
import { isDomainMapping, isDomainRegistration } from './product-identification';

export function getDomainProductRanking( product ) {
	product = formatProduct( product );

	if ( isDomainRegistration( product ) ) {
		return 0;
	} else if ( isDomainMapping( product ) ) {
		return 1;
	}
}
