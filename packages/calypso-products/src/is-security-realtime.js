/**
 * Internal dependencies
 */
import { isSecurityRealTimePlan } from './main';
import { snakeCase } from './snake-case';

export function isSecurityRealTime( product ) {
	product = snakeCase( product );

	return isSecurityRealTimePlan( product.product_slug );
}
