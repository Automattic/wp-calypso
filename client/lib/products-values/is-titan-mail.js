/**
 * Internal dependencies
 */
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import { TITAN_MAIL_MONTHLY_SLUG } from 'calypso/lib/titan/constants';

export function isTitanMail( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return product.product_slug === TITAN_MAIL_MONTHLY_SLUG;
}
