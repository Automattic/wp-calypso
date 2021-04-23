/**
 * Internal dependencies
 */
import { isCompletePlan } from './main';
import { snakeCase } from './snake-case';

export function isComplete( product ) {
	product = snakeCase( product );

	return isCompletePlan( product.product_slug );
}
