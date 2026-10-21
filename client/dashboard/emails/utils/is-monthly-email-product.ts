import { TitanMailSlugs, GoogleWorkspaceSlugs } from '@automattic/api-core';

const MONTHLY_EMAIL_PRODUCT_SLUGS: readonly string[] = [
	TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG,
	TitanMailSlugs.TITAN_MAIL_PREMIUM_MONTHLY_SLUG,
	TitanMailSlugs.TITAN_MAIL_ULTRA_MONTHLY_SLUG,
	GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
];

export function isMonthlyEmailProduct( emailProduct: { product_slug: string } ): boolean {
	return MONTHLY_EMAIL_PRODUCT_SLUGS.includes( emailProduct.product_slug );
}
