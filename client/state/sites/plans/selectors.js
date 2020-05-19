/**
 * External dependencies
 */

import { find, get } from 'lodash';
import debugFactory from 'debug';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { initialSiteState } from './reducer';
import { getSite } from 'state/sites/selectors';
import { createSitePlanObject } from './assembler';
import createSelector from 'lib/create-selector';
import { calculateMonthlyPriceForPlan, planHasFeature } from 'lib/plans';

/**
 * Module dependencies
 */
const debug = debugFactory( 'calypso:state:sites:plans:selectors' );

export function getPlansBySite( state, site ) {
	if ( ! site ) {
		return initialSiteState;
	}
	return getPlansBySiteId( state, site.ID );
}

export function getPlansBySiteId( state, siteId ) {
	if ( ! siteId ) {
		return initialSiteState;
	}
	return state.sites.plans[ siteId ] || initialSiteState;
}

export const getCurrentPlan = ( state, siteId ) => {
	const plans = getPlansBySiteId( state, siteId );
	if ( plans.data ) {
		const currentPlan = find( plans.data, 'currentPlan' );

		if ( currentPlan ) {
			debug( 'current plan: %o', currentPlan );
			return currentPlan;
		}

		const site = getSite( state, siteId );
		const plan = createSitePlanObject( site.plan );
		debug( 'current plan: %o', plan );
		return plan;
	}
	return null;
};

/**
 * Returns a site specific plan
 *
 * @param  {object} state        global state
 * @param  {number} siteId       the site id
 * @param  {string} productSlug  the plan product slug
 * @returns {object} the matching plan
 */
export const getSitePlan = createSelector(
	( state, siteId, productSlug ) => {
		const plansBySiteId = getPlansBySiteId( state, siteId );
		if ( ! plansBySiteId || ! plansBySiteId.data ) {
			return null;
		}
		return plansBySiteId.data.filter( ( plan ) => plan.productSlug === productSlug ).shift();
	},
	( state, siteId ) => getPlansBySiteId( state, siteId )
);

/**
 * Returns true if a plan is discounted
 *
 * @param  {object}   state         global state
 * @param  {number}   siteId        the site id
 * @param  {string}   productSlug   the plan product slug
 * @returns {?boolean}              true if a plan has a discount
 */
export function isSitePlanDiscounted( state, siteId, productSlug ) {
	const plan = getSitePlan( state, siteId, productSlug );

	if ( ! plan ) {
		return null;
	}

	return get( plan, 'rawDiscount', -1 ) > 0;
}

/**
 * Returns a plan price, including any applied discounts
 *
 * @param  {object}  state         global state
 * @param  {number}  siteId        the site id
 * @param  {string}  productSlug   the plan product slug
 * @param  {boolean} isMonthly     if true, returns monthly price
 * @returns {number}                plan discounted raw price
 */
export function getPlanDiscountedRawPrice(
	state,
	siteId,
	productSlug,
	{ isMonthly = false } = {}
) {
	const plan = getSitePlan( state, siteId, productSlug );

	if ( get( plan, 'rawPrice', -1 ) < 0 || ! isSitePlanDiscounted( state, siteId, productSlug ) ) {
		return null;
	}
	const discountPrice = plan.rawPrice;
	return isMonthly ? calculateMonthlyPriceForPlan( productSlug, discountPrice ) : discountPrice;
}

/**
 * Returns a plan price before discount
 *
 * @param  {object}  state         global state
 * @param  {number}  siteId        the site id
 * @param  {string}  productSlug   the plan product slug
 * @param  {boolean} isMonthly     if true, returns monthly price
 * @returns {number}                plan raw price
 */
export function getSitePlanRawPrice( state, siteId, productSlug, { isMonthly = false } = {} ) {
	const plan = getSitePlan( state, siteId, productSlug );

	if ( get( plan, 'rawPrice', -1 ) < 0 ) {
		return null;
	}

	const price = plan.rawPrice + get( plan, 'rawDiscount', 0 );

	return isMonthly ? calculateMonthlyPriceForPlan( productSlug, price ) : price;
}

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
