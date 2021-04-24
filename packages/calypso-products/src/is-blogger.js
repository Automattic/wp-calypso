/**
 * Internal dependencies
 */
import { isBloggerPlan } from './main';
import { snakeCase } from './snake-case';

export function isBlogger( product ) {
	product = snakeCase( product );
	return isBloggerPlan( product.product_slug );
}
