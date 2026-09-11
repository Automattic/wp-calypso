import type { AgencyProduct, JetpackLicense } from '@automattic/api-core';

export const WPCOM_HOSTING_FAMILY_SLUG = 'wpcom-hosting';
export const PRESSABLE_HOSTING_FAMILY_SLUG = 'pressable-hosting';
export const WPCOM_CREATOR_PLAN_SLUG = 'wpcom-hosting-business';

/** The WordPress.com plan sold on the Hosting page: the Creator plan, or the first one. */
export function getWpcomPlan( products: AgencyProduct[] ): AgencyProduct | undefined {
	const plans = products.filter( ( product ) => product.family_slug === WPCOM_HOSTING_FAMILY_SLUG );
	return plans.find( ( product ) => product.slug === WPCOM_CREATOR_PLAN_SLUG ) ?? plans[ 0 ];
}

const matchesProduct = ( license: JetpackLicense, product: AgencyProduct | undefined ) =>
	!! product &&
	( license.product_id === product.product_id ||
		license.product_id === product.monthly_product_id ||
		license.product_id === product.yearly_product_id );

const isDevSiteLicense = ( license: JetpackLicense ) =>
	!! license.meta?.a4a_is_dev_site && license.meta.a4a_is_dev_site !== '0';

// Sites the agency pays for itself: referred sites and free development
// sites don't count towards the volume discount.
export function countOwnedWpcomSites(
	licenses: JetpackLicense[],
	plan: AgencyProduct | undefined
): number {
	return licenses.filter(
		( license ) =>
			matchesProduct( license, plan ) && ! license.referral && ! isDevSiteLicense( license )
	).length;
}
