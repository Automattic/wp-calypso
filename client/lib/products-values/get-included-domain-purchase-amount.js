/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function getIncludedDomainPurchaseAmount( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.included_domain_purchase_amount;
}
