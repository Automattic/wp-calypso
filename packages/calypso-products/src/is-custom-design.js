/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isCustomDesign( product ) {
	product = snakeCase( product );

	return 'custom-design' === product.product_slug;
}
