/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isGuidedTransfer( product ) {
	product = snakeCase( product );

	return 'guided_transfer' === product.product_slug;
}
