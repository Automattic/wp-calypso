/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { TITAN_MAIL_MONTHLY_SLUG } from './plans-constants';

export function isTitanMail( product ) {
	product = snakeCase( product );

	return product.product_slug === TITAN_MAIL_MONTHLY_SLUG;
}
