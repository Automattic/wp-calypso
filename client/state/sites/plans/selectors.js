/**
 * External dependencies
 */
import find from 'lodash/find';
import get from 'lodash/get';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { initialSiteState } from './reducer';
import { getSite } from 'state/sites/selectors';
import { createSitePlanObject } from './assembler';
import createSelector from 'lib/create-selector';

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
 * @param  {Object} state        global state
 * @param  {Number} siteId       the site id
 * @param  {String} productSlug  the plan product slug
 * @return {Object} the matching plan
 */
export const getSitePlan = createSelector(
	( state, siteId, productSlug ) => {
		const plansBySiteId = getPlansBySiteId( state, siteId );
		if ( ! plansBySiteId || plansBySiteId.isRequesting || ! plansBySiteId.data ) {
			return null;
		}
		return plansBySiteId.data.filter( plan => plan.productSlug === productSlug ).shift();
	},
	( state, siteId ) => getPlansBySiteId( state, siteId )
);

/**
 * Returns a plan discount price
 * @param  {Object}  state         global state
 * @param  {Number}  siteId       the site id
 * @param  {String}  productSlug   the plan product slug
 * @param  {Boolean} isMonthly     if true, returns monthly price
 * @return {Number}  plan discount price
 */
export function getPlanDiscountPrice( state, siteId, productSlug, isMonthly = false ) {
	const plan = getSitePlan( state, siteId, productSlug );

	if ( get( plan, 'rawPrice', -1 ) < 0 || get( plan, 'rawDiscount', -1 ) <= 0 ) {
		return null;
	}

	const discountPrice = plan.rawPrice;

	return isMonthly ? parseFloat( ( discountPrice / 12 ).toFixed( 2 ) ) : discountPrice;
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
