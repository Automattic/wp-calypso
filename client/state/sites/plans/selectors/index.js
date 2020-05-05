/**
 * External dependencies
 */
import { get } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { initialSiteState } from 'state/sites/plans/reducer';
import { calculateMonthlyPriceForPlan, planHasFeature } from 'lib/plans';

import { getPlansBySiteId } from 'state/sites/plans/selectors/get-plans-by-site';
import { getCurrentPlan } from 'state/sites/plans/selectors/get-current-plan';
import { getSitePlan } from 'state/sites/plans/selectors/get-site-plan';
import { isSitePlanDiscounted } from 'state/sites/plans/selectors/is-site-plan-discounted';

export { getPlansBySite, getPlansBySiteId } from 'state/sites/plans/selectors/get-plans-by-site';
export { getCurrentPlan } from 'state/sites/plans/selectors/get-current-plan';
export { getSitePlan } from 'state/sites/plans/selectors/get-site-plan';
export { isSitePlanDiscounted } from 'state/sites/plans/selectors/is-site-plan-discounted';
export { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors/get-plan-discounted-raw-price';
export { getSitePlanRawPrice } from 'state/sites/plans/selectors/get-site-plan-raw-price';

/**
 * Returns a plan raw discount. It's the value which was subtracted from the plan's original raw price.
 * Use getPlanDiscountedRawPrice if you need a plan's raw price after applying the discount.
 *
 * @param  {object}  state        global state
 * @param  {number}  siteId       the site id
 * @param  {string}  productSlug  the plan product slug
 * @param  {boolean} isMonthly    if true, returns monthly price
 * @returns {number}               plan raw discount
 */
export function getPlanRawDiscount( state, siteId, productSlug, { isMonthly = false } = {} ) {
	const plan = getSitePlan( state, siteId, productSlug );

	if ( ! isSitePlanDiscounted( state, siteId, productSlug ) ) {
		return null;
	}

	return isMonthly
		? calculateMonthlyPriceForPlan( productSlug, plan.rawDiscount )
		: plan.rawDiscount;
}

export function hasDomainCredit( state, siteId ) {
	if ( ! siteId ) {
		return initialSiteState;
	}
	const currentPlan = getCurrentPlan( state, siteId );
	return get( currentPlan, 'hasDomainCredit', null );
}

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
