import {
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_PERSONAL,
	TERM_ANNUALLY,
	findFirstSimilarPlanKey,
	getPlan,
	isFreePlan,
	isWpComMonthlyPlan,
} from '@automattic/calypso-products';

interface ProductWithBillingCycle {
	product_slug: string;
	product_term?: string;
}

export function getPreferredBillingCycleProductSlug(
	products: Array< ProductWithBillingCycle >,
	currentPlanSlug?: string
): string {
	if ( products.length === 0 ) {
		throw new Error( 'No products available' );
	}
	let preferredBillingCycle = 'month';

	if ( currentPlanSlug && ! isWpComMonthlyPlan( currentPlanSlug ) ) {
		preferredBillingCycle = 'year';
	}

	const preferredProduct = products.find(
		( product ) => product.product_term === preferredBillingCycle
	);
	return preferredProduct?.product_slug ?? products[ 0 ].product_slug;
}

/**
 * Returns the plan to add to the cart alongside an externally managed theme for a site that isn't eligible for it.
 * eCommerce trial sites can only upgrade to eCommerce, so they're offered that instead.
 * @param currentPlanSlug The site's current plan slug.
 * @returns The plan slug, on the same term as the current paid plan or annual otherwise.
 */
export function getExternallyManagedThemeRequiredPlanSlug( currentPlanSlug?: string ): string {
	let requiredTerm = TERM_ANNUALLY;
	if ( currentPlanSlug && ! isFreePlan( currentPlanSlug ) ) {
		requiredTerm = getPlan( currentPlanSlug )?.term || TERM_ANNUALLY;
	}

	const minimumPlan =
		currentPlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY ? PLAN_ECOMMERCE : PLAN_PERSONAL;

	return findFirstSimilarPlanKey( minimumPlan, { term: requiredTerm } ) || minimumPlan;
}
