/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isSiteRedirect( product ) {
	product = snakeCase( product );

	return product.product_slug === 'offsite_redirect';
}
