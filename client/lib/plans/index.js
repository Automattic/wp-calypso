/** @format */

/**
 * External dependencies
 */

import moment from 'moment';
import { find, get, includes, invoke } from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { isFreeJetpackPlan, isJetpackPlan, isMonthly } from 'lib/products-values';
import {
	FEATURES_LIST,
	PLANS_LIST,
	PLAN_FREE,
	PLAN_JETPACK_FREE,
	PLAN_PERSONAL,
} from 'lib/plans/constants';
import {
	TERM_ANNUALLY,
	TERM_MONTHLY,
	TYPE_BUSINESS,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
} from './constants';

/**
 * Module vars
 */
const isPersonalPlanEnabled = isEnabled( 'plans/personal-plan' );

export function getPlans() {
	return PLANS_LIST;
}

export function getPlan( planKey ) {
	const plan = PLANS_LIST[ planKey ];
	if ( ! plan ) {
		throw new Error( `There is no such plan as "${ planKey }"` );
	}
	return plan;
}

export function getValidFeatureKeys() {
	return Object.keys( FEATURES_LIST );
}

export function isValidFeatureKey( feature ) {
	return !! FEATURES_LIST[ feature ];
}

export function getFeatureByKey( feature ) {
	return FEATURES_LIST[ feature ];
}

export function getFeatureTitle( feature ) {
	return invoke( FEATURES_LIST, [ feature, 'getTitle' ] );
}

export function canUpgradeToPlan( planKey, site ) {
	// Which "free plan" should we use to test
	const freePlan =
		get( site, 'jetpack', false ) && ! get( site, [ 'options', 'is_automated_transfer' ], false )
			? PLAN_JETPACK_FREE
			: PLAN_FREE;
	const plan = get( site, [ 'plan', 'expired' ], false )
		? freePlan
		: get( site, [ 'plan', 'product_slug' ], freePlan );
	return get( getPlan( planKey ), 'availableFor', () => false )( plan );
}

export function getUpgradePlanSlugFromPath( path, site ) {
	return find(
		Object.keys( PLANS_LIST ),
		planKey =>
			( planKey === path || getPlanPath( planKey ) === path ) && canUpgradeToPlan( planKey, site )
	);
}

export function getPlanPath( plan ) {
	return get( getPlan( plan ), 'getPathSlug', () => undefined )();
}

export function planHasFeature( plan, feature ) {
	return includes( get( getPlan( plan ), 'getFeatures', () => [] )(), feature );
}

export function getCurrentTrialPeriodInDays( plan ) {
	const { expiryMoment, subscribedDayMoment, userFacingExpiryMoment } = plan;

	if ( isInGracePeriod( plan ) ) {
		return expiryMoment.diff( userFacingExpiryMoment, 'days' );
	}

	return userFacingExpiryMoment.diff( subscribedDayMoment, 'days' );
}

export function getDayOfTrial( plan ) {
	const { subscribedDayMoment } = plan;

	// we return the difference plus one day so that the first day is day 1 instead of day 0
	return (
		moment()
			.startOf( 'day' )
			.diff( subscribedDayMoment, 'days' ) + 1
	);
}

export function getDaysUntilUserFacingExpiry( plan ) {
	const { userFacingExpiryMoment } = plan;

	return userFacingExpiryMoment.diff( moment().startOf( 'day' ), 'days' );
}

export function getDaysUntilExpiry( plan ) {
	const { expiryMoment } = plan;

	return expiryMoment.diff( moment().startOf( 'day' ), 'days' );
}

export function isInGracePeriod( plan ) {
	return getDaysUntilUserFacingExpiry( plan ) <= 0;
}

export function shouldFetchSitePlans( sitePlans, selectedSite ) {
	return ! sitePlans.hasLoadedFromServer && ! sitePlans.isRequesting && selectedSite;
}

export function filterPlansBySiteAndProps(
	plans,
	site,
	hideFreePlan,
	intervalType,
	showJetpackFreePlan
) {
	const hasPersonalPlan = site && site.plan.product_slug === PLAN_PERSONAL;

	return plans.filter( function( plan ) {
		if ( site && site.jetpack ) {
			if ( 'monthly' === intervalType ) {
				if ( showJetpackFreePlan ) {
					return isJetpackPlan( plan ) && isMonthly( plan );
				}
				return isJetpackPlan( plan ) && ! isFreeJetpackPlan( plan ) && isMonthly( plan );
			}

			if ( showJetpackFreePlan ) {
				return isJetpackPlan( plan ) && ! isMonthly( plan );
			}

			return isJetpackPlan( plan ) && ! isFreeJetpackPlan( plan ) && ! isMonthly( plan );
		}

		if ( hideFreePlan && PLAN_FREE === plan.product_slug ) {
			return false;
		}

		if ( plan.product_slug === PLAN_PERSONAL && ! ( hasPersonalPlan || isPersonalPlanEnabled ) ) {
			return false;
		}

		return ! isJetpackPlan( plan );
	} );
}

/**
 * Returns the monthly slug which corresponds to the provided yearly slug or "" if the slug is
 * not a recognized or cannot be converted.
 *
 * @param  {String} planSlug Slug to convert to monthly.
 * @return {String}          Monthly version slug or "" if the slug could not be converted.
 */
export function getMonthlyPlanByYearly( planSlug ) {
	return findSimilarPlan( planSlug, { term: TERM_MONTHLY } );
}

/**
 * Returns the yearly slug which corresponds to the provided monthly slug or "" if the slug is
 * not a recognized or cannot be converted.
 *
 * @param  {String} planSlug Slug to convert to yearly.
 * @return {String}          Yearly version slug or "" if the slug could not be converted.
 */
export function getYearlyPlanByMonthly( planSlug ) {
	return findSimilarPlan( planSlug, { term: TERM_ANNUALLY } );
}

/**
 * Returns true if plan "types" match regardless of their interval.
 *
 * For example (fake plans):
 *     planLevelsMatch( PRO_YEARLY, PRO_YEARLY ) => true
 *     planLevelsMatch( PRO_YEARLY, PRO_MONTHLY ) => true
 *     planLevelsMatch( PRO_YEARLY, PERSONAL_YEARLY ) => false
 *
 * @param  {String}  planSlugA One of the plan slugs to compare
 * @param  {String}  planSlugB One of the plan slugs to compare
 * @return {Boolean}           Whether the plan "types" match regardless of interval
 */
export function planLevelsMatch( planSlugA, planSlugB ) {
	const planA = getPlan( planSlugA );
	const planB = getPlan( planSlugB );
	return planA && planB && planA.type === planB.type && planA.group === planB.group;
}

export function isBusinessPlan( planSlug ) {
	return getPlan( planSlug ).type === TYPE_BUSINESS;
}

export function isPremiumPlan( planSlug ) {
	return getPlan( planSlug ).type === TYPE_PREMIUM;
}

export function isPersonalPlan( planSlug ) {
	return getPlan( planSlug ).type === TYPE_PERSONAL;
}

export function isFreePlan( planSlug ) {
	return getPlan( planSlug ).type === TYPE_FREE;
}

export function findSimilarPlan( similarToPlanSlug, query = {} ) {
	const plan = getPlan( similarToPlanSlug );
	const type = query.type || plan.type;
	const group = query.group || plan.group;
	const term = query.term || plan.term;

	return getPlans().filter( p => p.type === type && p.group === group && p.term === term )[ 0 ];
}

export const isPlanFeaturesEnabled = () => {
	return isEnabled( 'manage/plan-features' );
};

export function plansLink( url, site, intervalType ) {
	if ( 'monthly' === intervalType ) {
		url += '/monthly';
	}

	if ( site && site.slug ) {
		url += '/' + site.slug;
	}

	return url;
}

export function applyTestFiltersToPlansList( planName, abtest ) {
	const filteredPlanConstantObj = { ...getPlan( planName ) };
	const filteredPlanFeaturesConstantList = getPlan( planName ).getFeatures( abtest );

	// these becomes no-ops when we removed some of the abtest overrides, but
	// we're leaving the code in place for future tests
	const removeDisabledFeatures = () => {};

	const updatePlanDescriptions = () => {};

	const updatePlanFeatures = () => {};

	removeDisabledFeatures();
	updatePlanDescriptions();
	updatePlanFeatures();

	filteredPlanConstantObj.getFeatures = () => filteredPlanFeaturesConstantList;

	return filteredPlanConstantObj;
}
