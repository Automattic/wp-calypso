/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isConciergeSession( product ) {
	product = snakeCase( product );

	return 'concierge-session' === product.product_slug;
}
