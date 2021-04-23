/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isSpaceUpgrade( product ) {
	product = snakeCase( product );

	return (
		'1gb_space_upgrade' === product.product_slug ||
		'5gb_space_upgrade' === product.product_slug ||
		'10gb_space_upgrade' === product.product_slug ||
		'50gb_space_upgrade' === product.product_slug ||
		'100gb_space_upgrade' === product.product_slug
	);
}
