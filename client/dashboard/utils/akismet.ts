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
 * Returns the display name for an Akismet Pro or Business product, appending the
 * current monthly request allotment (e.g. "Akismet Pro (8K requests/month)").
 * For any other product, the given product name is returned unchanged.
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

	if ( isAkismetPro500Plan( productSlug ) && quantity >= 1 ) {
		const requestsInThousands = ( AKISMET_PRO_REQUESTS_PER_QUANTITY * quantity ) / 1000;
		/* translators: %(productName)s is the product name (e.g. "Akismet Pro"); %(requestsK)d is the monthly request count in thousands, rendered as "NK" (e.g. "8K"). */
		return sprintf( __( '%(productName)s (%(requestsK)dK requests/month)' ), {
			productName: baseName,
			requestsK: requestsInThousands,
		} );
	}

	if ( isAkismetBusiness5kPlan( productSlug ) ) {
		const requestsInThousands = AKISMET_BUSINESS_REQUESTS_PER_MONTH / 1000;
		/* translators: %(productName)s is the product name (e.g. "Akismet Business"); %(requestsK)d is the monthly request count in thousands, rendered as "NK" (e.g. "80K"). */
		return sprintf( __( '%(productName)s (%(requestsK)dK requests/month)' ), {
			productName: baseName,
			requestsK: requestsInThousands,
		} );
	}

	return productName;
}
