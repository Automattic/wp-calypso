/**
 * Internal dependencies
 */
import { formatProduct } from './format-product';

export function getIncludedDomainPurchaseAmount( product ) {
	product = formatProduct( product );

	return product.included_domain_purchase_amount;
}
