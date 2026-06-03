import { AkismetPlans } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';

// "Pro 500" / "Business 5k" are legacy names retained for backend product-slug
// stability (ak_pro5h_*, ak_bus5k_*). The current allotments are 8000
// requests/month per Pro quantity and 80000 requests/month for Business.
const AKISMET_PRO_REQUESTS_PER_QUANTITY = 8000;
const AKISMET_BUSINESS_REQUESTS_PER_MONTH = 80000;

/**
 * Determines whether the specified product slug is for an Akismet Pro 500 plan.
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to any Akismeret Pro 500 plan, false otherwise
 */
export function isAkismetPro500Plan( productSlug: string ): boolean {
	return (
		[
			AkismetPlans.PRODUCT_AKISMET_PRO_500_MONTHLY,
			AkismetPlans.PRODUCT_AKISMET_PRO_500_YEARLY,
			AkismetPlans.PRODUCT_AKISMET_PRO_500_BI_YEARLY,
		] as readonly string[]
	 ).includes( productSlug );
}

/**
 * Determines whether the specified product slug is for an Akismet Business 5k plan.
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to any Akismet Business 5k plan, false otherwise
 */
export function isAkismetBusiness5kPlan( productSlug: string ): boolean {
	return (
		[
			AkismetPlans.PRODUCT_AKISMET_BUSINESS_5K_MONTHLY,
			AkismetPlans.PRODUCT_AKISMET_BUSINESS_5K_YEARLY,
			AkismetPlans.PRODUCT_AKISMET_BUSINESS_5K_BI_YEARLY,
		] as readonly string[]
	 ).includes( productSlug );
}

/**
 * Determines whether the specified product slug is for an Akismet plan that has a
 * synthesized display name (Akismet Pro 500 or Business 5k).
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to such a plan, false otherwise
 */
export function isAkismetProOrBusinessPlan( productSlug: string ): boolean {
	return isAkismetPro500Plan( productSlug ) || isAkismetBusiness5kPlan( productSlug );
}

/**
 * Returns the display name for an Akismet Pro or Business product, appending the
 * current monthly request allotment (e.g. "Akismet Pro (8K requests/month)").
 *
 * Assumes the product is an Akismet Pro 500 or Business 5k plan; guard calls with
 * {@link isAkismetProOrBusinessPlan}.
 * @param {string} productName - the product name to format
 * @param {string} productSlug - slug of the product
 * @param {number} quantity - the licensed/renewal quantity (Pro scales with this)
 * @returns {string} the formatted display name
 */
export function getAkismetProductDisplayName(
	productName: string,
	productSlug: string,
	quantity: number
): string {
	const baseName = productName.replace( /\s*\(.*$/, '' ).trim();
	const isPro = isAkismetPro500Plan( productSlug );

	// The Pro allotment scales with quantity; a quantity below 1 has no
	// meaningful allotment, so fall back to the bare product name. Business is a
	// flat monthly allotment that ignores quantity.
	if ( isPro && quantity < 1 ) {
		return baseName;
	}

	const requestsInThousands = isPro
		? ( AKISMET_PRO_REQUESTS_PER_QUANTITY * quantity ) / 1000
		: AKISMET_BUSINESS_REQUESTS_PER_MONTH / 1000;

	/* translators: %(productName)s is the product name (e.g. "Akismet Pro"); %(requestsK)d is the monthly request count in thousands, rendered as "NK" (e.g. "8K"). */
	return sprintf( __( '%(productName)s (%(requestsK)dK requests/month)' ), {
		productName: baseName,
		requestsK: requestsInThousands,
	} );
}
