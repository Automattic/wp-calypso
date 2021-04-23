/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isUnlimitedSpace( product ) {
	product = snakeCase( product );

	return 'unlimited_space' === product.product_slug;
}
