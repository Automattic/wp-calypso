/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function getIncludedDomainPurchaseAmount( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.included_domain_purchase_amount;
}
