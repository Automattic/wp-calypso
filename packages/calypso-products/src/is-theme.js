/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isTheme( product ) {
	product = snakeCase( product );

	return 'premium_theme' === product.product_slug;
}
