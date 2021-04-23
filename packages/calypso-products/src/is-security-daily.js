/**
 * Internal dependencies
 */
import { isSecurityDailyPlan } from './main';
import { snakeCase } from './snake-case';

export function isSecurityDaily( product ) {
	product = snakeCase( product );

	return isSecurityDailyPlan( product.product_slug );
}
