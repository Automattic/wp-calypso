/**
 * External dependencies
 */
import { get } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { planHasFeature } from 'lib/plans';

import { getPlansBySiteId } from 'state/sites/plans/selectors/get-plans-by-site';
import { getCurrentPlan } from 'state/sites/plans/selectors/get-current-plan';

export { getPlansBySite, getPlansBySiteId } from 'state/sites/plans/selectors/get-plans-by-site';
export { getCurrentPlan } from 'state/sites/plans/selectors/get-current-plan';
export { getSitePlan } from 'state/sites/plans/selectors/get-site-plan';
export { isSitePlanDiscounted } from 'state/sites/plans/selectors/is-site-plan-discounted';
export { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors/get-plan-discounted-raw-price';
export { getSitePlanRawPrice } from 'state/sites/plans/selectors/get-site-plan-raw-price';
export { getPlanRawDiscount } from 'state/sites/plans/selectors/get-plan-raw-discount';
export { hasDomainCredit } from 'state/sites/plans/selectors/has-domain-credit';

export function isRequestingSitePlans( state, siteId ) {
	const plans = getPlansBySiteId( state, siteId );
	return plans.isRequesting;
}

export function isCurrentPlanExpiring( state, siteId ) {
	const currentPlan = getCurrentPlan( state, siteId );

	if ( ! currentPlan || ! currentPlan.expiryDate ) {
		return true;
	}

	const expiration = moment( currentPlan.expiryDate ).startOf( 'day' );
	return expiration < moment().add( 30, 'days' );
}

/**
 * Returns true if current user is also a current plan owner.
 *
 * @param  {object}  state        global state
 * @param  {number}  siteId       the site id
 * @returns {boolean}			  True when user is a plan owner
 */
export function isCurrentUserCurrentPlanOwner( state, siteId ) {
	const currentPlan = getCurrentPlan( state, siteId );

	return get( currentPlan, 'userIsOwner', false );
}

/**
 * Returns a site's current plan's product slug
 *
 * @param  {object}  state   Global State tree
 * @param  {number}  siteId  Site ID
 * @returns {?string}          The site's current plan's product slug
 */
export function getSitePlanSlug( state, siteId ) {
	return get( getCurrentPlan( state, siteId ), 'productSlug', null );
}

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
