/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isNoAds( product ) {
	product = snakeCase( product );
	return 'no-adverts/no-adverts.php' === product.product_slug;
}
