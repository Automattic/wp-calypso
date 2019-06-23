/** @format */

/**
 * External dependencies
 */
import moment from 'moment';
import { format as urlFormat, parse as urlParse } from 'url';
import { difference, get, includes, pick, values } from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { isFreeJetpackPlan, isJetpackPlan, isMonthly } from 'lib/products-values';
import {
	PLAN_FREE,
	PLAN_PERSONAL,
	TERM_MONTHLY,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_FREE,
	TYPE_BLOGGER,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	GROUP_WPCOM,
	GROUP_JETPACK,
} from './constants';
import { PLANS_LIST } from './plans-list';

/**
 * Module vars
 */
const isPersonalPlanEnabled = isEnabled( 'plans/personal-plan' );

export function getPlans() {
	return PLANS_LIST;
}

export function getPlan( planKey ) {
	if ( Object.prototype.toString.apply( planKey ) === '[object Object]' ) {
		if ( values( PLANS_LIST ).indexOf( planKey ) !== -1 ) {
			return planKey;
		}
	}
	return PLANS_LIST[ planKey ];
}

export function getPlanPath( plan ) {
	const retrievedPlan = getPlan( plan );
	const slug = retrievedPlan.getPathSlug || ( () => undefined );
	return slug();
}

export function getPlanClass( planKey ) {
	if ( isFreePlan( planKey ) ) {
		return 'is-free-plan';
	}

	if ( isBloggerPlan( planKey ) ) {
		return 'is-blogger-plan';
	}

	if ( isPersonalPlan( planKey ) ) {
		return 'is-personal-plan';
	}

	if ( isPremiumPlan( planKey ) ) {
		return 'is-premium-plan';
	}

	if ( isBusinessPlan( planKey ) ) {
		return 'is-business-plan';
	}

	if ( isEcommercePlan( planKey ) ) {
		return 'is-ecommerce-plan';
	}

	return '';
}

/**
 * Determines if a plan has a specific feature.
 *
 * Collects features for a plan by calling all possible feature methods for the plan.
 *
 * @param   {Object|String} plan    Plan object or plan name.
 * @param   {String}        feature Feature name.
 * @returns {Boolean}               Whether the specified plan has the specified feature.
 */
export function planHasFeature( plan, feature ) {
	const planConstantObj = getPlan( plan );

	// Collect features from all plan methods (may have duplicates)
	const allFeatures = [
		'getPlanCompareFeatures',
		'getPromotedFeatures',
		'getSignupFeatures',
		'getBlogSignupFeatures',
		'getPortfolioSignupFeatures',
		'getHiddenFeatures',
	].reduce(
		( featuresArray, featureMethodName ) => [
			...get( planConstantObj, featureMethodName, () => [] )(),
			...featuresArray,
		],
		[]
	);

	return includes( allFeatures, feature );
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
	return findFirstSimilarPlanKey( planSlug, { term: TERM_MONTHLY } ) || '';
}

/**
 * Returns the yearly slug which corresponds to the provided monthly slug or "" if the slug is
 * not a recognized or cannot be converted.
 *
 * @param  {String} planSlug Slug to convert to yearly.
 * @return {String}          Yearly version slug or "" if the slug could not be converted.
 */
export function getYearlyPlanByMonthly( planSlug ) {
	return findFirstSimilarPlanKey( planSlug, { term: TERM_ANNUALLY } ) || '';
}

/**
 * Returns the biennial slug which corresponds to the provided slug or "" if the slug is
 * not a recognized or cannot be converted.
 *
 * @param  {String} planSlug Slug to convert to biennial.
 * @return {String}          Biennial version slug or "" if the slug could not be converted.
 */
export function getBiennialPlan( planSlug ) {
	return findFirstSimilarPlanKey( planSlug, { term: TERM_BIENNIALLY } ) || '';
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

export function isEcommercePlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_ECOMMERCE } );
}

export function isBusinessPlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_BUSINESS } );
}

export function isPremiumPlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_PREMIUM } );
}

export function isPersonalPlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_PERSONAL } );
}

export function isBloggerPlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_BLOGGER } );
}

export function isFreePlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_FREE } );
}

export function isWpComBusinessPlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_BUSINESS, group: GROUP_WPCOM } );
}

export function isWpComEcommercePlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_ECOMMERCE, group: GROUP_WPCOM } );
}

export function isWpComPremiumPlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_PREMIUM, group: GROUP_WPCOM } );
}

export function isWpComPersonalPlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_PERSONAL, group: GROUP_WPCOM } );
}

export function isWpComBloggerPlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_BLOGGER, group: GROUP_WPCOM } );
}

export function isWpComFreePlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_FREE, group: GROUP_WPCOM } );
}

export function isJetpackBusinessPlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_BUSINESS, group: GROUP_JETPACK } );
}

export function isJetpackPremiumPlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_PREMIUM, group: GROUP_JETPACK } );
}

export function isJetpackPersonalPlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_PERSONAL, group: GROUP_JETPACK } );
}

export function isJetpackFreePlan( planSlug ) {
	return planMatches( planSlug, { type: TYPE_FREE, group: GROUP_JETPACK } );
}

/**
 * @see findSimilarPlansKeys
 *
 * @param {string|object} planKey Source plan to compare to
 * @param {object} diff Properties that should differ in matched plan. @see planMatches
 * @return {string|undefined} Matched plan
 */
export function findFirstSimilarPlanKey( planKey, diff ) {
	return findSimilarPlansKeys( planKey, diff )[ 0 ];
}

/**
 * A similar plan is one that has the same `type`, `group`, and `term` as first
 * argument, except for differences specified in the second argument.
 *
 * For example:
 *
 * > findSimilarPlansKeys( TYPE_BUSINESS, { term: TERM_BIENNIALLY } );
 * [PLAN_BUSINESS_2_YEARS]
 * > findSimilarPlansKeys( TYPE_JETPACK_BUSINESS_MONTHLY, { type: TYPE_ANNUALLY } );
 * [TYPE_JETPACK_BUSINESS]
 *
 * @param {string|object} planKey Source plan to compare to
 * @param {object} diff Properties that should differ in matched plan. @see planMatches
 * @return {string[]} Matched plans keys
 */
export function findSimilarPlansKeys( planKey, diff = {} ) {
	const plan = getPlan( planKey );
	// @TODO: make getPlan() throw an error on failure. This is going to be a larger change with a separate PR.
	if ( ! plan ) {
		return [];
	}
	return findPlansKeys( {
		...pick( plan, 'type', 'group', 'term' ),
		...diff,
	} );
}

/**
 * Finds all keys of plans matching a query
 *
 * For example:
 *
 * > findPlansKeys( { term: TERM_BIENNIALLY } );
 * [PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS, PLAN_BUSINESS_2_YEARS]
 *
 * @param {object} query @see planMatches
 * @return {string[]} Matched plans keys
 */
export function findPlansKeys( query = {} ) {
	const plans = getPlans();
	return Object.keys( plans ).filter( k => planMatches( plans[ k ], query ) );
}

/**
 * Matches plan specified by `planKey` against `query`.
 * Only compares `type`, `group`, and `term` properties.
 *
 * For example:
 *
 * > planMatches( TYPE_BUSINESS, { term: TERM_ANNUALLY, group: GROUP_WPCOM, type: TYPE_BUSINESS } );
 * true
 *
 * > planMatches( TYPE_BUSINESS, { term: TERM_BIENNIALLY } );
 * false
 *
 * @param {string|object} planKey Plan to match
 * @param {object} query Properties that should match
 * @return {bool} Does `planKey` match?
 */
export function planMatches( planKey, query = {} ) {
	const acceptedKeys = [ 'type', 'group', 'term' ];
	const unknownKeys = difference( Object.keys( query ), acceptedKeys );
	if ( unknownKeys.length ) {
		throw new Error(
			`planMatches can only match against ${ acceptedKeys.join( ',' ) }, ` +
				`but unknown keys ${ unknownKeys.join( ',' ) } were passed.`
		);
	}

	// @TODO: make getPlan() throw an error on failure. This is going to be a larger change with a separate PR.
	const plan = getPlan( planKey ) || {};
	const match = key => ! ( key in query ) || plan[ key ] === query[ key ];
	return match( 'type' ) && match( 'group' ) && match( 'term' );
}

export function calculateMonthlyPriceForPlan( planSlug, termPrice ) {
	return calculateMonthlyPrice( getPlan( planSlug ).term, termPrice );
}

export function calculateMonthlyPrice( term, termPrice ) {
	const divisor = getBillingMonthsForTerm( term );
	return parseFloat( ( termPrice / divisor ).toFixed( 2 ) );
}

export function getBillingMonthsForPlan( planSlug ) {
	return getBillingMonthsForTerm( getPlan( planSlug ).term );
}

export function getBillingMonthsForTerm( term ) {
	if ( term === TERM_MONTHLY ) {
		return 1;
	} else if ( term === TERM_ANNUALLY ) {
		return 12;
	} else if ( term === TERM_BIENNIALLY ) {
		return 24;
	}

	throw new Error( `Unknown term: ${ term }` );
}

export function plansLink( url, siteSlug, intervalType, forceIntervalType = false ) {
	const parsedUrl = urlParse( url );
	if ( 'monthly' === intervalType || forceIntervalType ) {
		parsedUrl.pathname += '/' + intervalType;
	}

	if ( siteSlug ) {
		parsedUrl.pathname += '/' + siteSlug;
	}

	return urlFormat( parsedUrl );
}

export function applyTestFiltersToPlansList( planName, abtest ) {
	const filteredPlanConstantObj = { ...getPlan( planName ) };
	const filteredPlanFeaturesConstantList = getPlan( planName ).getPlanCompareFeatures( abtest );

	// these becomes no-ops when we removed some of the abtest overrides, but
	// we're leaving the code in place for future tests
	const removeDisabledFeatures = () => {};

	const updatePlanDescriptions = () => {};

	const updatePlanFeatures = () => {};

	removeDisabledFeatures();
	updatePlanDescriptions();
	updatePlanFeatures();

	filteredPlanConstantObj.getPlanCompareFeatures = () => filteredPlanFeaturesConstantList;

	return filteredPlanConstantObj;
}

export function getPlanTermLabel( planName, translate ) {
	const plan = getPlan( planName );
	if ( ! plan || ! plan.term ) {
		return;
	}

	switch ( plan.term ) {
		case TERM_MONTHLY:
			return translate( 'Monthly subscription' );
		case TERM_ANNUALLY:
			return translate( 'Annual subscription' );
		case TERM_BIENNIALLY:
			return translate( 'Two year subscription' );
	}
}

export const getPopularPlanType = siteType => {
	switch ( siteType ) {
		case 'blog':
			return TYPE_PERSONAL;
		case 'professional':
			return TYPE_PREMIUM;
		default:
			return TYPE_BUSINESS;
	}
};

export const getPopularPlanSpec = ( { customerType, isJetpack, siteType, abtest } ) => {
	const spec = {
		type: TYPE_BUSINESS,
		group: isJetpack ? GROUP_JETPACK : GROUP_WPCOM,
	};

	// Not sure why, but things break if the abtest lib is imported in this file
	if ( ! siteType || abtest( 'popularPlanBy' ) === 'customerType' ) {
		if ( customerType === 'personal' ) {
			spec.type = TYPE_PREMIUM;
		}
		return spec;
	}

	spec.type = getPopularPlanType( siteType );

	return spec;
};

export const chooseDefaultCustomerType = ( {
	currentCustomerType,
	selectedPlan,
	currentPlan,
	siteType,
	abtest,
} ) => {
	if ( currentCustomerType ) {
		return currentCustomerType;
	}

	if ( abtest( 'popularPlanBy' ) === 'siteType' ) {
		// Choose the tab that will make the "POPULAR" label visible when the
		// page is first loaded.
		switch ( siteType ) {
			case 'blog':
			case 'professional':
				return 'personal';
			default:
				return 'business';
		}
	}

	const group = GROUP_WPCOM;
	const businessPlanSlugs = [
		findPlansKeys( { group, term: TERM_ANNUALLY, type: TYPE_PREMIUM } )[ 0 ],
		findPlansKeys( { group, term: TERM_BIENNIALLY, type: TYPE_PREMIUM } )[ 0 ],
		findPlansKeys( { group, term: TERM_ANNUALLY, type: TYPE_BUSINESS } )[ 0 ],
		findPlansKeys( { group, term: TERM_BIENNIALLY, type: TYPE_BUSINESS } )[ 0 ],
		findPlansKeys( { group, term: TERM_ANNUALLY, type: TYPE_ECOMMERCE } )[ 0 ],
		findPlansKeys( { group, term: TERM_BIENNIALLY, type: TYPE_ECOMMERCE } )[ 0 ],
	]
		.map( planKey => getPlan( planKey ) )
		.map( plan => plan.getStoreSlug() );

	if ( selectedPlan ) {
		return businessPlanSlugs.includes( selectedPlan ) ? 'business' : 'personal';
	} else if ( currentPlan ) {
		const isPlanInBusinessGroup = businessPlanSlugs.indexOf( currentPlan.product_slug ) !== -1;
		return isPlanInBusinessGroup ? 'business' : 'personal';
	}

	return 'personal';
};
