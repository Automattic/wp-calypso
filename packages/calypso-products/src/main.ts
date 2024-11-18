import {
	FEATURE_JETPACK_SEARCH,
	FEATURE_JETPACK_SEARCH_MONTHLY,
	GROUP_JETPACK,
	GROUP_P2,
	GROUP_WPCOM,
	JETPACK_RESET_PLANS,
	PLAN_HOSTING_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_PLUS,
	PLAN_WOOEXPRESS_SMALL,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_CENTENNIALLY,
	TERM_DECENNIALLY,
	TERM_MONTHLY,
	TERM_NOVENNIALLY,
	TERM_OCTENNIALLY,
	TERM_QUADRENNIALLY,
	TERM_QUINQUENNIALLY,
	TERM_SEPTENNIALLY,
	TERM_SEXENNIALLY,
	TERM_TRIENNIALLY,
	TYPE_100_YEAR,
	TYPE_ALL,
	TYPE_BLOGGER,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_ENTERPRISE_GRID_WPCOM,
	TYPE_FLEXIBLE,
	TYPE_FREE,
	TYPE_JETPACK_STARTER,
	TYPE_P2_PLUS,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_PRO,
	TYPE_SECURITY_DAILY,
	TYPE_SECURITY_REALTIME,
	TYPE_SECURITY_T1,
	TYPE_SECURITY_T2,
	TYPE_STARTER,
	TYPE_JETPACK_GROWTH,
	WOO_EXPRESS_PLANS,
} from './constants';
import {
	resolveFeatureGroupsForComparisonGrid,
	resolveFeatureGroupsForFeaturesGrid,
	resolveWooExpressFeatureGroupsForComparisonGrid,
} from './feature-group-plan-map';
import { FEATURES_LIST } from './features-list';
import { PLANS_LIST } from './plans-list';
import {
	getProductFromSlug,
	isBusiness,
	isEcommerce,
	isEnterprise,
	isJetpackBusiness,
	isPro,
	isVipPlan,
} from '.';
import type {
	FeatureGroupMap,
	FeatureList,
	JetpackPlan,
	Plan,
	PlanMatchesQuery,
	PlanSlug,
	Product,
	WithCamelCaseSlug,
	WithSnakeCaseSlug,
	WPComPlan,
} from './types';
import type { TranslateResult } from 'i18n-calypso';

export function getPlans(): Record< string, Plan > {
	return PLANS_LIST;
}

export function getSimplifiedPlanFeaturesGroupedForFeaturesGrid() {
	return resolveFeatureGroupsForFeaturesGrid( { showSimplifiedFeatures: true } );
}

export function getPlanFeaturesGroupedForFeaturesGrid(): Partial< FeatureGroupMap > {
	return resolveFeatureGroupsForFeaturesGrid();
}

export function getPlanFeaturesGroupedForComparisonGrid(): Partial< FeatureGroupMap > {
	return resolveFeatureGroupsForComparisonGrid();
}

export function getWooExpressFeaturesGroupedForFeaturesGrid(): Partial< FeatureGroupMap > {
	// Same as getPlanFeaturesGroupedForFeaturesGrid() for now
	return getPlanFeaturesGroupedForFeaturesGrid();
}

export function getWooExpressFeaturesGroupedForComparisonGrid(): Partial< FeatureGroupMap > {
	return resolveWooExpressFeatureGroupsForComparisonGrid();
}

export function getPlansSlugs(): string[] {
	return Object.keys( getPlans() );
}

export function getPlan( planKey: string | Plan ): Plan | JetpackPlan | WPComPlan | undefined {
	if ( typeof planKey !== 'string' ) {
		if ( Object.values( PLANS_LIST ).includes( planKey ) ) {
			return planKey;
		}
		return undefined;
	}
	return PLANS_LIST[ planKey ];
}

export function getPlanByPathSlug( pathSlug: string, group?: string ): Plan | undefined {
	let plans: Plan[] = Object.values( PLANS_LIST );
	plans = plans.filter( ( p ) => ( group ? p.group === group : true ) );
	return plans.find( ( p ) => typeof p.getPathSlug === 'function' && p.getPathSlug() === pathSlug );
}

export function getPlanPath( plan: string ): string | undefined {
	const retrievedPlan = getPlan( plan );
	const slug = retrievedPlan?.getPathSlug || ( () => undefined );
	return slug();
}

export function getPlanClass( planKey: string ): string {
	if ( isFreePlan( planKey ) ) {
		return 'is-free-plan';
	}

	if ( isFlexiblePlan( planKey ) ) {
		return 'is-flexible-plan';
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

	if ( isWooExpressPlusPlan( planKey ) ) {
		return 'is-wooexpress-plus-plan';
	}

	if ( isWooExpressMediumPlan( planKey ) ) {
		return 'is-wooexpress-medium-plan';
	}

	if ( isWooExpressSmallPlan( planKey ) ) {
		return 'is-wooexpress-small-plan';
	}

	if ( isEcommercePlan( planKey ) ) {
		return 'is-ecommerce-plan';
	}

	if ( isWpcomEnterpriseGridPlan( planKey ) ) {
		return 'is-wpcom-enterprise-grid-plan';
	}

	if ( isProPlan( planKey ) ) {
		return 'is-pro-plan';
	}

	if ( isSecurityDailyPlan( planKey ) ) {
		return 'is-daily-security-plan';
	}

	if ( isSecurityRealTimePlan( planKey ) ) {
		return 'is-realtime-security-plan';
	}

	if ( isSecurityT1Plan( planKey ) ) {
		return 'is-security-t1';
	}

	if ( isSecurityT2Plan( planKey ) ) {
		return 'is-security-t2';
	}

	if ( isCompletePlan( planKey ) ) {
		return 'is-complete-plan';
	}

	if ( isFreeHostingTrial( planKey ) ) {
		return 'is-free-hosting-trial';
	}

	if ( isP2PlusPlan( planKey ) ) {
		return 'is-p2-plus-plan';
	}

	return '';
}

/**
 * Determines if a plan has a specific feature.
 *
 * Collects features for a plan by calling all possible feature methods for the plan.
 */
export function planHasFeature( plan: string | Plan, feature: string ): boolean {
	const allFeatures = getAllFeaturesForPlan( plan );
	return allFeatures.includes( feature );
}

/**
 * Determine if a plan has at least one of several features.
 */
export function planHasAtLeastOneFeature( plan: string | Plan, features: string[] ): boolean {
	const allFeatures = getAllFeaturesForPlan( plan );
	return features.some( ( feature ) => allFeatures.includes( feature ) );
}

/**
 * Get all features for a plan
 *
 * Collects features for a plan by calling all possible feature methods for the plan.
 *
 * Returns an array of all the plan features (may have duplicates)
 */
export function getAllFeaturesForPlan( plan: Plan | string ): TranslateResult[] {
	const planObj = getPlan( plan );
	if ( ! planObj ) {
		return [];
	}
	return [
		...( 'getPlanCompareFeatures' in planObj && planObj.getPlanCompareFeatures
			? planObj.getPlanCompareFeatures()
			: [] ),
		...( 'getPromotedFeatures' in planObj && planObj.getPromotedFeatures
			? planObj.getPromotedFeatures()
			: [] ),
		...( 'getSignupFeatures' in planObj && planObj.getSignupFeatures
			? planObj.getSignupFeatures()
			: [] ),
		...( 'getSignupCompareAvailableFeatures' in planObj && planObj.getSignupCompareAvailableFeatures
			? planObj.getSignupCompareAvailableFeatures()
			: [] ),
		...( 'getBlogSignupFeatures' in planObj && planObj.getBlogSignupFeatures
			? planObj.getBlogSignupFeatures()
			: [] ),
		...( 'getPortfolioSignupFeatures' in planObj && planObj.getPortfolioSignupFeatures
			? planObj.getPortfolioSignupFeatures()
			: [] ),
		...( 'getIncludedFeatures' in planObj && planObj.getIncludedFeatures
			? planObj.getIncludedFeatures()
			: [] ),
	];
}

/**
 * Determines if a plan has a superior version of a specific feature.
 */
export function planHasSuperiorFeature( plan: string | Plan, feature: string ): boolean {
	const planConstantObj = getPlan( plan );
	const features = planConstantObj?.getInferiorFeatures?.() ?? [];
	return ( features as ReadonlyArray< string > ).includes( feature );
}

export function shouldFetchSitePlans( sitePlans: {
	hasLoadedFromServer: boolean;
	isRequesting: boolean;
} ): boolean {
	return ! sitePlans.hasLoadedFromServer && ! sitePlans.isRequesting;
}

/**
 * Returns the monthly slug which corresponds to the provided yearly slug or "" if the slug is
 * not a recognized or cannot be converted.
 */
export function getMonthlyPlanByYearly( planSlug: string ): string {
	const plan = getPlan( planSlug );
	if ( plan && 'getMonthlySlug' in plan && plan.getMonthlySlug ) {
		return plan.getMonthlySlug();
	}
	return findFirstSimilarPlanKey( planSlug, { term: TERM_MONTHLY } ) || '';
}

/**
 * Returns the yearly slug which corresponds to the provided monthly slug or "" if the slug is
 * not a recognized or cannot be converted.
 */
export function getYearlyPlanByMonthly( planSlug: string ): string {
	const plan = getPlan( planSlug );
	if ( plan && 'getAnnualSlug' in plan && plan.getAnnualSlug ) {
		return plan.getAnnualSlug();
	}
	return findFirstSimilarPlanKey( planSlug, { term: TERM_ANNUALLY } ) || '';
}

/**
 * Returns the biennial slug which corresponds to the provided slug or "" if the slug is
 * not a recognized or cannot be converted.
 */
export function getBiennialPlan( planSlug: string ): string {
	return findFirstSimilarPlanKey( planSlug, { term: TERM_BIENNIALLY } ) || '';
}

/**
 * Returns the triennial slug which corresponds to the provided slug or "" if the slug is
 * not recognized or cannot be converted.
 */
export function getTriennialPlan( planSlug: string ): string {
	return findFirstSimilarPlanKey( planSlug, { term: TERM_TRIENNIALLY } ) || '';
}

/**
 * Returns true if plan "types" match regardless of their interval.
 *
 * For example (fake plans):
 *     planLevelsMatch( PRO_YEARLY, PRO_YEARLY ) => true
 *     planLevelsMatch( PRO_YEARLY, PRO_MONTHLY ) => true
 *     planLevelsMatch( PRO_YEARLY, PERSONAL_YEARLY ) => false
 */
export function planLevelsMatch( planSlugA: string, planSlugB: string ): boolean {
	const planA = getPlan( planSlugA );
	const planB = getPlan( planSlugB );
	return Boolean( planA && planB && planA.type === planB.type && planA.group === planB.group );
}

export function isEcommercePlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_ECOMMERCE } );
}

export function isProPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_PRO } );
}

export function isBusinessPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_BUSINESS } );
}

export function isPremiumPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_PREMIUM } );
}

export function isPersonalPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_PERSONAL } );
}

export function isBloggerPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_BLOGGER } );
}

export function isFreePlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_FREE } );
}

export function isFreeHostingTrial( planSlug: string ): boolean {
	return planSlug === PLAN_HOSTING_TRIAL_MONTHLY;
}

export function isBusinessTrial( planSlug: string ): boolean {
	return planSlug === PLAN_HOSTING_TRIAL_MONTHLY || planSlug === PLAN_MIGRATION_TRIAL_MONTHLY;
}

export function is100YearPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_100_YEAR } );
}

// Checks if it is an Enterprise plan (a.k.a VIP), introduced as part of pdgrnI-1Qp-p2.
// This is not a real plan, but added to display Enterprise in the pricing grid.
export function isWpcomEnterpriseGridPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_ENTERPRISE_GRID_WPCOM, group: GROUP_WPCOM } );
}

export function isWooExpressPlusPlan( planSlug: string ): boolean {
	return PLAN_WOOEXPRESS_PLUS === planSlug;
}

export function isWooExpressMediumPlan( planSlug: string ): boolean {
	return [ PLAN_WOOEXPRESS_MEDIUM, PLAN_WOOEXPRESS_MEDIUM_MONTHLY ].includes( planSlug );
}

export function isWooExpressSmallPlan( planSlug: string ): boolean {
	return [ PLAN_WOOEXPRESS_SMALL, PLAN_WOOEXPRESS_SMALL_MONTHLY ].includes( planSlug );
}

export function isWooExpressPlan( planSlug: string ): boolean {
	return ( WOO_EXPRESS_PLANS as ReadonlyArray< string > ).includes( planSlug );
}

export function isFlexiblePlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_FLEXIBLE } );
}

export function isStarterPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_STARTER } );
}

export function isJetpackStarterPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_JETPACK_STARTER } );
}

export function isJetpackGrowthPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_JETPACK_GROWTH } );
}

export function isSecurityDailyPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_SECURITY_DAILY } );
}

export function isSecurityRealTimePlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_SECURITY_REALTIME } );
}

export function isSecurityT1Plan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_SECURITY_T1 } );
}

export function isSecurityT2Plan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_SECURITY_T2 } );
}

export function isCompletePlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_ALL } );
}

export function isWpComPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { group: GROUP_WPCOM } );
}

export function isWpComBusinessPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_BUSINESS, group: GROUP_WPCOM } );
}

export function isWpComEcommercePlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_ECOMMERCE, group: GROUP_WPCOM } );
}

export function isWpComProPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_PRO, group: GROUP_WPCOM } );
}

export function isWpComPremiumPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_PREMIUM, group: GROUP_WPCOM } );
}

export function isWpComPersonalPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_PERSONAL, group: GROUP_WPCOM } );
}

export function isWpComBloggerPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_BLOGGER, group: GROUP_WPCOM } );
}

export function isWpComFreePlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_FREE, group: GROUP_WPCOM } );
}

export function isWpComAnnualPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { term: TERM_ANNUALLY, group: GROUP_WPCOM } );
}

export function isWpComBiennialPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { term: TERM_BIENNIALLY, group: GROUP_WPCOM } );
}

export function isWpComTriennialPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { term: TERM_TRIENNIALLY, group: GROUP_WPCOM } );
}

export function isWpComMonthlyPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { term: TERM_MONTHLY, group: GROUP_WPCOM } );
}

export function isJetpackBusinessPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_BUSINESS, group: GROUP_JETPACK } );
}

export function isJetpackPremiumPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_PREMIUM, group: GROUP_JETPACK } );
}

export function isJetpackPersonalPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_PERSONAL, group: GROUP_JETPACK } );
}

export function isJetpackFreePlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_FREE, group: GROUP_JETPACK } );
}

export function isJetpackOfferResetPlan( planSlug: string ): boolean {
	return ( JETPACK_RESET_PLANS as ReadonlyArray< string > ).includes( planSlug );
}

export function isP2FreePlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_FREE, group: GROUP_P2 } );
}

export function isP2PlusPlan( planSlug: string ): boolean {
	return planMatches( planSlug, { type: TYPE_P2_PLUS } );
}

export function findFirstSimilarPlanKey(
	planKey: string | Plan,
	diff: PlanMatchesQuery
): string | undefined {
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
 */
export function findSimilarPlansKeys(
	planKey: string | Plan,
	diff: PlanMatchesQuery = {}
): string[] {
	const plan = getPlan( planKey );
	// @TODO: make getPlan() throw an error on failure. This is going to be a larger change with a separate PR.
	if ( ! plan ) {
		return [];
	}
	return findPlansKeys( {
		type: plan.type,
		group: plan.group,
		term: plan.term,
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
 */
export function findPlansKeys( query: PlanMatchesQuery = {} ): string[] {
	const plans = getPlans();
	return Object.keys( plans ).filter( ( k ) => planMatches( plans[ k ], query ) );
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
 */
export function planMatches( planKey: string | Plan, query: PlanMatchesQuery = {} ): boolean {
	const acceptedKeys = [ 'type', 'group', 'term' ];
	const unknownKeys = Object.keys( query ).filter( ( key ) => ! acceptedKeys.includes( key ) );
	if ( unknownKeys.length ) {
		throw new Error(
			`planMatches can only match against ${ acceptedKeys.join( ',' ) }, ` +
				`but unknown keys ${ unknownKeys.join( ',' ) } were passed.`
		);
	}

	// @TODO: make getPlan() throw an error on failure. This is going to be a larger change with a separate PR.
	const plan = getPlan( planKey );
	if ( ! plan ) {
		return false;
	}
	if (
		( ! ( 'type' in query ) || plan.type === query.type ) &&
		( ! ( 'group' in query ) || plan.group === query.group ) &&
		( ! ( 'term' in query ) || plan.term === query.term )
	) {
		return true;
	}
	return false;
}

export function calculateMonthlyPriceForPlan( planSlug: string, termPrice: number ): number {
	const plan = getPlan( planSlug );
	if ( ! plan ) {
		throw new Error( `Unknown plan: ${ planSlug }` );
	}
	return calculateMonthlyPrice( plan.term, termPrice );
}

export function calculateMonthlyPrice( term: string, termPrice: number ): number {
	const divisor = getBillingMonthsForTerm( term );
	return parseFloat( ( termPrice / divisor ).toFixed( 2 ) );
}

export function getBillingMonthsForTerm( term: string ): number {
	if ( term === TERM_MONTHLY ) {
		return 1;
	} else if ( term === TERM_ANNUALLY ) {
		return 12;
	} else if ( term === TERM_BIENNIALLY ) {
		return 24;
	} else if ( term === TERM_TRIENNIALLY ) {
		return 36;
	} else if ( term === TERM_QUADRENNIALLY ) {
		return 48;
	} else if ( term === TERM_QUINQUENNIALLY ) {
		return 60;
	} else if ( term === TERM_SEXENNIALLY ) {
		return 72;
	} else if ( term === TERM_SEPTENNIALLY ) {
		return 84;
	} else if ( term === TERM_OCTENNIALLY ) {
		return 96;
	} else if ( term === TERM_NOVENNIALLY ) {
		return 108;
	} else if ( term === TERM_DECENNIALLY ) {
		return 120;
	} else if ( term === TERM_CENTENNIALLY ) {
		return 1200;
	}
	throw new Error( `Unknown term: ${ term }` );
}

export function getBillingYearsForTerm( term: string ): number {
	if ( term === TERM_MONTHLY ) {
		return 0;
	} else if ( term === TERM_ANNUALLY ) {
		return 1;
	} else if ( term === TERM_BIENNIALLY ) {
		return 2;
	} else if ( term === TERM_TRIENNIALLY ) {
		return 3;
	} else if ( term === TERM_CENTENNIALLY ) {
		return 100;
	}
	throw new Error( `Unknown term: ${ term }` );
}

export function getBillingTermForMonths( term: number ): string {
	if ( term === 1 ) {
		return TERM_MONTHLY;
	} else if ( term === 12 ) {
		return TERM_ANNUALLY;
	} else if ( term === 24 ) {
		return TERM_BIENNIALLY;
	} else if ( term === 36 ) {
		return TERM_TRIENNIALLY;
	} else if ( term === 48 ) {
		return TERM_QUADRENNIALLY;
	} else if ( term === 60 ) {
		return TERM_QUINQUENNIALLY;
	} else if ( term === 72 ) {
		return TERM_SEXENNIALLY;
	} else if ( term === 84 ) {
		return TERM_SEPTENNIALLY;
	} else if ( term === 96 ) {
		return TERM_OCTENNIALLY;
	} else if ( term === 108 ) {
		return TERM_NOVENNIALLY;
	} else if ( term === 120 ) {
		return TERM_DECENNIALLY;
	} else if ( term === 1200 ) {
		return TERM_CENTENNIALLY;
	}
	throw new Error( `Unknown term: ${ term }` );
}

export function plansLink(
	urlString: string,
	siteSlug: string | undefined | null,
	intervalType: string,
	forceIntervalType = false
): string {
	const url = new URL( urlString, window.location.origin );

	if ( 'monthly' === intervalType || forceIntervalType ) {
		url.pathname += '/' + intervalType;
	}

	if ( siteSlug ) {
		url.pathname += '/' + siteSlug;
	}

	if ( urlString.startsWith( '/' ) ) {
		return url.pathname + url.search;
	}
	return url.toString();
}

export type FilteredPlan = Plan &
	Pick<
		WPComPlan,
		| 'getPlanCompareFeatures'
		| 'getAnnualPlansOnlyFeatures'
		| 'getPlanTagline'
		| 'getNewsletterTagLine'
		| 'getLinkInBioTagLine'
		| 'getBlogOnboardingTagLine'
	>;

export function applyTestFiltersToPlansList(
	planName: string | Plan,
	abtest: string | undefined,
	extraArgs: Record< string, string | boolean[] > = {}
): FilteredPlan {
	const plan = getPlan( planName );
	if ( ! plan ) {
		throw new Error( `Unknown plan: ${ planName }` );
	}
	const filteredPlanConstantObj = { ...plan };
	const filteredPlanFeaturesConstantList =
		'getPlanCompareFeatures' in plan && plan.getPlanCompareFeatures
			? plan.getPlanCompareFeatures( abtest, extraArgs )
			: [];

	/* eslint-disable @typescript-eslint/no-empty-function */

	// these becomes no-ops when we removed some of the abtest overrides, but
	// we're leaving the code in place for future tests
	const removeDisabledFeatures = () => {};

	const updatePlanDescriptions = () => {};

	const updatePlanFeatures = () => {};

	/* eslint-enable */

	removeDisabledFeatures();
	updatePlanDescriptions();
	updatePlanFeatures();

	return {
		...filteredPlanConstantObj,
		getPlanCompareFeatures: () => filteredPlanFeaturesConstantList,
	};
}

export function applyTestFiltersToProductsList(
	productName: string
): Product & Pick< WPComPlan, 'getPlanCompareFeatures' > {
	const product = getProductFromSlug( productName );
	if ( typeof product === 'string' ) {
		throw new Error( `Unknown product ${ productName } ` );
	}
	const filteredProductConstantObj = { ...product };

	/* eslint-disable @typescript-eslint/no-empty-function */

	// these becomes no-ops when we removed some of the abtest overrides, but
	// we're leaving the code in place for future tests
	const removeDisabledFeatures = () => {};

	const updatePlanDescriptions = () => {};

	const updatePlanFeatures = () => {};

	/* eslint-enable */

	removeDisabledFeatures();
	updatePlanDescriptions();
	updatePlanFeatures();

	return {
		...filteredProductConstantObj,
		getPlanCompareFeatures: () => [],
	};
}

export function getPlanTermLabel(
	planName: string,
	translate: ( text: string ) => string
): string | undefined {
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
		case TERM_TRIENNIALLY:
			return translate( 'Three year subscription' );
		case TERM_CENTENNIALLY:
			return translate( 'Hundred year subscription' );
	}
}

export const getPopularPlanSpec = ( {
	flowName,
	customerType,
	isJetpack,
	availablePlans,
}: {
	flowName?: string | null;
	customerType: string;
	isJetpack: boolean;
	availablePlans: string[];
} ): false | { type: string; group: string } => {
	// Jetpack doesn't currently highlight "Popular" plans
	if ( isJetpack ) {
		return false;
	}

	if ( availablePlans.length === 0 ) {
		return false;
	}

	const defaultPlan = getPlan( availablePlans[ 0 ] );

	if ( ! defaultPlan ) {
		return false;
	}

	const group = GROUP_WPCOM;

	if ( flowName === 'hosting' ) {
		return {
			type: TYPE_BUSINESS,
			group,
		};
	}

	if ( flowName === 'link-in-bio' || flowName === 'link-in-bio-tld' ) {
		return {
			type: TYPE_PERSONAL,
			group,
		};
	}

	if ( customerType === 'personal' ) {
		if ( availablePlans.findIndex( isPremiumPlan ) !== -1 ) {
			return {
				type: TYPE_PREMIUM,
				group,
			};
		}
		// when customerType is not personal, default to business
	} else if ( availablePlans.findIndex( isBusinessPlan ) !== -1 ) {
		return {
			type: TYPE_BUSINESS,
			group,
		};
	}

	// finally, just return the default one.
	return {
		type: defaultPlan.type,
		group,
	};
};

function isValueTruthy< T >( value: T ): value is Exclude< T, null | undefined | false | 0 | '' > {
	return !! value;
}

export const chooseDefaultCustomerType = ( {
	currentCustomerType,
	selectedPlan,
	currentPlan,
}: {
	currentCustomerType: string;
	selectedPlan?: string;
	currentPlan: { productSlug: PlanSlug | undefined };
} ): string => {
	if ( currentCustomerType ) {
		return currentCustomerType;
	}

	const group = GROUP_WPCOM;
	const businessPlanSlugs = [
		findPlansKeys( { group, term: TERM_ANNUALLY, type: TYPE_PREMIUM } )[ 0 ],
		findPlansKeys( { group, term: TERM_BIENNIALLY, type: TYPE_PREMIUM } )[ 0 ],
		findPlansKeys( { group, term: TERM_TRIENNIALLY, type: TYPE_PREMIUM } )[ 0 ],
		findPlansKeys( { group, term: TERM_ANNUALLY, type: TYPE_BUSINESS } )[ 0 ],
		findPlansKeys( { group, term: TERM_BIENNIALLY, type: TYPE_BUSINESS } )[ 0 ],
		findPlansKeys( { group, term: TERM_TRIENNIALLY, type: TYPE_BUSINESS } )[ 0 ],
		findPlansKeys( { group, term: TERM_ANNUALLY, type: TYPE_ECOMMERCE } )[ 0 ],
		findPlansKeys( { group, term: TERM_BIENNIALLY, type: TYPE_ECOMMERCE } )[ 0 ],
		findPlansKeys( { group, term: TERM_TRIENNIALLY, type: TYPE_ECOMMERCE } )[ 0 ],
		findPlansKeys( { group, term: TERM_ANNUALLY, type: TYPE_PRO } )[ 0 ],
		findPlansKeys( { group, term: TERM_BIENNIALLY, type: TYPE_PRO } )[ 0 ],
	]
		.map( ( planKey ) => getPlan( planKey ) )
		.filter( isValueTruthy )
		.map( ( plan ) => plan.getStoreSlug() );

	if ( selectedPlan ) {
		return businessPlanSlugs.includes( selectedPlan as PlanSlug ) ? 'business' : 'personal';
	} else if ( currentPlan ) {
		const isPlanInBusinessGroup =
			businessPlanSlugs.indexOf( currentPlan.productSlug as PlanSlug ) !== -1;
		return isPlanInBusinessGroup ? 'business' : 'personal';
	}

	return 'personal';
};

/**
 * Determines if a plan includes Jetpack Search by looking at the plan's features.
 */
export const planHasJetpackSearch = ( planSlug: string ): boolean =>
	planHasFeature( planSlug, FEATURE_JETPACK_SEARCH ) ||
	planHasFeature( planSlug, FEATURE_JETPACK_SEARCH_MONTHLY );

/**
 * Determines if a plan includes Jetpack Search Classic by checking available plans.
 */
export function planHasJetpackClassicSearch(
	plan: WithCamelCaseSlug | WithSnakeCaseSlug
): boolean {
	return (
		plan &&
		( isJetpackBusiness( plan ) ||
			isBusiness( plan ) ||
			isEnterprise( plan ) ||
			isEcommerce( plan ) ||
			isPro( plan ) ||
			isVipPlan( plan ) )
	);
}

export function getFeaturesList(): FeatureList {
	return FEATURES_LIST;
}

export const getPlanFeaturesObject = ( planFeaturesList?: Array< string > ) => {
	if ( ! planFeaturesList ) {
		return [];
	}
	return planFeaturesList.map( ( featuresConst ) => FEATURES_LIST[ featuresConst ] );
};

export function isValidFeatureKey( feature: string ) {
	return !! FEATURES_LIST[ feature ];
}

export function getFeatureByKey( feature: string ) {
	return FEATURES_LIST[ feature ];
}
