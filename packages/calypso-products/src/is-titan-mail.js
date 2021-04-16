/**
 * Internal dependencies
 */
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';
import { TITAN_MAIL_MONTHLY_SLUG } from './constants';

export function isTitanMail( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === TITAN_MAIL_MONTHLY_SLUG;
}
