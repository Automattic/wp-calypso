/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isDomainRegistration } from 'calypso/lib/products-values/is-domain-registration';
import { isDomainMapping } from 'calypso/lib/products-values/is-domain-mapping';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function getDomainProductRanking(
	product: FormattedProduct | CamelCaseProduct
): number | undefined {
	product = formatProduct( product );
	if ( isDomainRegistration( product ) ) {
		return 0;
	} else if ( isDomainMapping( product ) ) {
		return 1;
	}
}
