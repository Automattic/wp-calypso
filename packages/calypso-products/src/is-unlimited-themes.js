/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isUnlimitedThemes( product ) {
	product = snakeCase( product );

	return 'unlimited_themes' === product.product_slug;
}
