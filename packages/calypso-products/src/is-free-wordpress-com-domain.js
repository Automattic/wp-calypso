/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isFreeWordPressComDomain( product ) {
	product = snakeCase( product );
	return product.is_free === true;
}
