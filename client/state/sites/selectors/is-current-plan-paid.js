import getSitePlan from './get-site-plan';

/**
 * Returns true if the current site plan is a paid one
 *
 * @param  {Object}   state         Global state tree
 * @param  {number}   siteId        Site ID
 * @returns {?boolean}               Whether the current plan is paid
 */
export default function isCurrentPlanPaid( state, siteId ) {
	const sitePlan = getSitePlan( state, siteId );

	if ( ! sitePlan ) {
		return null;
	}

	return sitePlan.product_id !== 1 && sitePlan.product_id !== 2002;
}
