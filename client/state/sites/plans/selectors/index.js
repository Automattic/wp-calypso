/**
 * Internal dependencies
 */
import { planHasFeature } from 'lib/plans';

import { getSitePlanSlug } from 'state/sites/plans/selectors/get-site-plan-slug';

export { getPlansBySite, getPlansBySiteId } from 'state/sites/plans/selectors/get-plans-by-site';
export { getCurrentPlan } from 'state/sites/plans/selectors/get-current-plan';
export { getSitePlan } from 'state/sites/plans/selectors/get-site-plan';
export { isSitePlanDiscounted } from 'state/sites/plans/selectors/is-site-plan-discounted';
export { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors/get-plan-discounted-raw-price';
export { getSitePlanRawPrice } from 'state/sites/plans/selectors/get-site-plan-raw-price';
export { getPlanRawDiscount } from 'state/sites/plans/selectors/get-plan-raw-discount';
export { hasDomainCredit } from 'state/sites/plans/selectors/has-domain-credit';
export { isRequestingSitePlans } from 'state/sites/plans/selectors/is-requesting-site-plans';
export { isCurrentPlanExpiring } from 'state/sites/plans/selectors/is-current-plan-expiring';
export { isCurrentUserCurrentPlanOwner } from 'state/sites/plans/selectors/is-current-user-current-plan-owner';
export { getSitePlanSlug } from 'state/sites/plans/selectors/get-site-plan-slug';

/**
 * Whether a site's current plan includes a given feature
 *
 * DO NOT USE THIS FOR FEATURE GATES, this is only to be used for deciding
 * if nudge should be shown.
 * If you want a feature gate, you should make it backend-side.
 *
 * @param  {object}  state   Global State tree
 * @param  {number}  siteId  Site ID
 * @param  {string}  feature The feature we're looking for
 * @returns {boolean}         True if the site's current plan includes the feature
 */
export function hasFeature( state, siteId, feature ) {
	return planHasFeature( getSitePlanSlug( state, siteId ), feature );
}
