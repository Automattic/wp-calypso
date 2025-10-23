import { TitanMailSlugs, GoogleWorkspaceSlugs } from '@automattic/api-core';

export function isMonthlyEmailProduct( emailProduct: { product_slug: string } ): boolean {
	return (
		emailProduct.product_slug === TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG ||
		emailProduct.product_slug === GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY
	);
}
