/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isBundled( product ) {
	product = snakeCase( product );

	return !! product.is_bundled;
}
