/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isCredits( product ) {
	product = snakeCase( product );

	return 'wordpress-com-credits' === product.product_slug;
}
