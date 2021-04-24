/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isVideoPress( product ) {
	product = snakeCase( product );
	return 'videopress' === product.product_slug;
}
