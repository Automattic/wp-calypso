import { TitanMailSlugs } from '@automattic/api-core';

const TITAN_SLUGS_BY_TIER: Record< string, Record< string, string > > = {
	pro: {
		monthly: TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG,
		yearly: TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG,
	},
	premium: {
		monthly: TitanMailSlugs.TITAN_MAIL_PREMIUM_MONTHLY_SLUG,
		yearly: TitanMailSlugs.TITAN_MAIL_PREMIUM_YEARLY_SLUG,
	},
	ultra: {
		monthly: TitanMailSlugs.TITAN_MAIL_ULTRA_MONTHLY_SLUG,
		yearly: TitanMailSlugs.TITAN_MAIL_ULTRA_YEARLY_SLUG,
	},
};

/**
 * Maps the `tier` and `billing` query params of the email onboarding flow to a
 * Titan product slug. Missing or unknown values fall back to Essential yearly.
 */
export function getTitanProductSlug( tier?: unknown, billing?: unknown ): string {
	const slugsByBilling =
		typeof tier === 'string' && Object.hasOwn( TITAN_SLUGS_BY_TIER, tier )
			? TITAN_SLUGS_BY_TIER[ tier ]
			: TITAN_SLUGS_BY_TIER.pro;

	return billing === 'monthly' ? slugsByBilling.monthly : slugsByBilling.yearly;
}
