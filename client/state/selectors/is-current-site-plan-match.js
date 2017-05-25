/**
 * Internal dependencies
 */
import { getSitePlanSlug } from 'state/sites/selectors';
import { getPlanSlug } from 'state/plans/selectors';

/**
 * Constants
 */
const MONTHLY_SUFFIX = '_monthly';

/**
 * Returns true if plan slugs match independently of intervals,
 * e.g. 'plan_business' matches 'plan_business_monthly' and vice-versa.
 *
 * Currently, this means comparing plans with a monthly suffix.
 * If other intervals are introduced, this code will need to be
 * updated accordingly.
 *
 * For example:
 *   isIntervalIndependentSlugMatch( 'plan_a', 'plan_b' ) => false
 *   isIntervalIndependentSlugMatch( 'plan_a', 'plan_b_monthly' ) => false
 *   isIntervalIndependentSlugMatch( 'plan_a', 'plan_a' ) => true
 *   isIntervalIndependentSlugMatch( 'plan_a', 'plan_a_monthly' ) => true
 *   isIntervalIndependentSlugMatch( 'plan_a_monthly', 'plan_a' ) => true
 *
 * This function is exported for testing purposes and is not meant for general use.
 * @private
 *
 * @param  {String}  planSlugA plan slug
 * @param  {String}  planSlugB plan slug
 * @return {Boolean} Whether the plan slugs match independently of their interval.
 */
export const isIntervalIndependentSlugMatch = ( planSlugA, planSlugB ) =>
	planSlugA === planSlugB ||
	`${ planSlugA }${ MONTHLY_SUFFIX }` === planSlugB ||
	planSlugA === `${ planSlugB }${ MONTHLY_SUFFIX }`;

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

	return isIntervalIndependentSlugMatch( sitePlanSlug, comparisonPlanSlug );
}
