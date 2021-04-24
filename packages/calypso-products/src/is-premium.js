/**
 * Internal dependencies
 */
import { isPremiumPlan } from './main';
import { snakeCase } from './snake-case';

export function isPremium( product ) {
	product = snakeCase( product );
	return isPremiumPlan( product.product_slug );
}
