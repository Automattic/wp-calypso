import { TITAN_MAIL_MONTHLY_SLUG } from './constants';
import { formatProduct } from './format-product';

export function isTitanMail( product ) {
	if ( ! product ) {
		return false;
	}

	product = formatProduct( product );

	return product.product_slug === TITAN_MAIL_MONTHLY_SLUG;
}
