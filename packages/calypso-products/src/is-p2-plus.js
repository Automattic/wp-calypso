/**
 * Internal dependencies
 */
import { isP2PlusPlan } from './main';
import { snakeCase } from './snake-case';

export function isP2Plus( product ) {
	product = snakeCase( product );
	return isP2PlusPlan( product.product_slug );
}
