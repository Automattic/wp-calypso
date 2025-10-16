import { Product } from '@automattic/api-core';
import { TITAN_MAIL_MONTHLY_SLUG } from '../constants';

export function isTitanMonthlyProduct( titanMailProduct: Product ): boolean {
	return titanMailProduct?.product_slug === TITAN_MAIL_MONTHLY_SLUG;
}
