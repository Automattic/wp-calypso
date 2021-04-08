/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { isDomainMapping } from 'calypso/lib/products-values/is-domain-mapping';
import { isDomainRegistration } from 'calypso/lib/products-values/is-domain-registration';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isDomainProduct( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isDomainMapping( product ) || isDomainRegistration( product );
}
