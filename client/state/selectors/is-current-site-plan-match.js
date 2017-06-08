/**
 * Internal dependencies
 */
import { getSitePlanSlug } from 'state/sites/selectors';
import { getPlanSlug } from 'state/plans/selectors';
import {
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
} from 'lib/plans/constants';

/**
 * Returns true if site's plan matches provided plan independently of intervals.
 *
 * @param  {Object}   state         Global state tree
 * @param  {Number}   siteId        Site ID
 * @param  {Number}   planProductId Plan product_id
 * @return {?Boolean}               Whether site's plan matches supplied plan independent of interval.
 */
export default function isCurrentSitePlanMatch( state, siteId, planProductId ) {
	const sitePlanSlug = getSitePlanSlug( state, siteId );
	if ( ! sitePlanSlug ) {
		return null;
	}

	const comparisonPlanSlug = getPlanSlug( state, planProductId );
	if ( ! comparisonPlanSlug ) {
		return null;
	}

	if ( sitePlanSlug === comparisonPlanSlug ) {
		return true;
	}

	switch ( sitePlanSlug ) {
		case PLAN_JETPACK_BUSINESS:
		case PLAN_JETPACK_BUSINESS_MONTHLY:
			return (
				comparisonPlanSlug === PLAN_JETPACK_BUSINESS ||
				comparisonPlanSlug === PLAN_JETPACK_BUSINESS_MONTHLY
			);
		case PLAN_JETPACK_PERSONAL:
		case PLAN_JETPACK_PERSONAL_MONTHLY:
			return (
				comparisonPlanSlug === PLAN_JETPACK_PERSONAL ||
				comparisonPlanSlug === PLAN_JETPACK_PERSONAL_MONTHLY
			);
		case PLAN_JETPACK_PREMIUM:
		case PLAN_JETPACK_PREMIUM_MONTHLY:
			return (
				comparisonPlanSlug === PLAN_JETPACK_PREMIUM ||
				comparisonPlanSlug === PLAN_JETPACK_PREMIUM_MONTHLY
			);
	}

	return false;
}
