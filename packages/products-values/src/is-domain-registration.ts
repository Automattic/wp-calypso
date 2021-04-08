/**
 * Internal dependencies
 */
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isDomainRegistration( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return !! product.is_domain_registration;
}
