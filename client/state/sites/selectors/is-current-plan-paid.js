import getSitePlan from './get-site-plan';

const FREE_PLAN_PRODUCT_IDS = [
	1, // Dotcom Free Plan
	2002, // Jetpack Free Plan
	4005, // Woo Hosted Free Plan
];

/**
 * Returns true if the current site plan is a paid one
 * @param  {Object}   state         Global state tree
 * @param  {number}   siteId        Site ID
 * @returns {?boolean}               Whether the current plan is paid
 */
export default function isCurrentPlanPaid( state, siteId ) {
	const sitePlan = getSitePlan( state, siteId );

	if ( ! sitePlan ) {
		return null;
	}

	return ! FREE_PLAN_PRODUCT_IDS.includes( sitePlan.product_id );
}
