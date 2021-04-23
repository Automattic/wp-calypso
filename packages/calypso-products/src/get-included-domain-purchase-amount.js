/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function getIncludedDomainPurchaseAmount( product ) {
	product = snakeCase( product );

	return product.included_domain_purchase_amount;
}
