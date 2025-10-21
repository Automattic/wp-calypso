import { Product, TitanMailSlugs } from '@automattic/api-core';

export function isTitanMonthlyProduct( titanMailProduct: Product ): boolean {
	return titanMailProduct?.product_slug === TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG;
}
