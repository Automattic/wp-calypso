import {
	TYPE_BLOGGER,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_ENTERPRISE_GRID_WPCOM,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_WOOEXPRESS_MEDIUM,
	TYPE_WOOEXPRESS_SMALL,
	getPlan,
	isBloggerPlan,
	TERMS_LIST,
	applyTestFiltersToPlansList,
	isMonthly,
	isWpcomEnterpriseGridPlan,
	TERM_MONTHLY,
	isWpComFreePlan,
	type FeatureList,
	type PlanSlug,
	type PlanType,
	type FeatureObject,
	type StorageOption,
	isBusinessPlan,
	isEcommercePlan,
	TYPE_P2_PLUS,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { isSamePlan } from '../../../lib/is-same-plan';
import useHighlightLabels from './use-highlight-labels';
import usePlansFromTypes from './use-plans-from-types';
import type { AddOnMeta, PlanIntroductoryOffer, PricedAPIPlan } from '@automattic/data-stores';
import type { TranslateResult } from 'i18n-calypso';

// TODO clk: move to plans data store
export type TransformedFeatureObject = FeatureObject & {
	availableForCurrentPlan: boolean;
	availableOnlyForAnnualPlans: boolean;
	isHighlighted?: boolean;
};

// TODO clk: move to plans data store
export interface PlanFeaturesForGridPlan {
	wpcomFeatures: TransformedFeatureObject[];
	jetpackFeatures: TransformedFeatureObject[];
	storageOptions: StorageOption[];
	// used for comparison grid so far
	conditionalFeatures?: FeatureObject[];
}

// TODO clk: move to plans data store
export interface PricingMetaForGridPlan {
	billingPeriod?: PricedAPIPlan[ 'bill_period' ] | null;
	currencyCode?: PricedAPIPlan[ 'currency_code' ] | null;
	originalPrice: {
		monthly: number | null;
		full: number | null;
	};
	// if discounted prices are provided (not null), they will take precedence over originalPrice.
	// UI will show original with a strikethrough or grayed out
	discountedPrice: {
		monthly: number | null;
		full: number | null;
	};
	// intro offers override billing and pricing shown in the UI
	// they are currently defined off the site plans (so not defined when siteId is not available)
	introOffer?: PlanIntroductoryOffer | null;
	// Expiry date is only available from site plans and is the expiry date of an existing plan.
	expiry?: string | null;
}

export type UsePricedAPIPlans = ( { planSlugs }: { planSlugs: PlanSlug[] } ) => {
	[ planSlug: string ]: PricedAPIPlan | null | undefined;
} | null;

export type UsePricingMetaForGridPlans = ( {
	planSlugs,
	withoutProRatedCredits,
	storageAddOns,
}: {
	planSlugs: PlanSlug[];
	withoutProRatedCredits?: boolean;
	storageAddOns: ( AddOnMeta | null )[] | null;
} ) => { [ planSlug: string ]: PricingMetaForGridPlan } | null;

export type UseFreeTrialPlanSlugs = ( {
	intent,
	eligibleForFreeHostingTrial,
}: {
	intent: PlansIntent;
	eligibleForFreeHostingTrial: boolean;
} ) => {
	[ Type in PlanType ]?: PlanSlug;
};

// TODO clk: move to types. will consume plan properties
export type GridPlan = {
	planSlug: PlanSlug;
	freeTrialPlanSlug?: PlanSlug;
	isVisible: boolean;
	features: {
		wpcomFeatures: TransformedFeatureObject[];
		jetpackFeatures: TransformedFeatureObject[];
		storageOptions: StorageOption[];
		conditionalFeatures?: FeatureObject[];
	};
	tagline: TranslateResult;
	availableForPurchase: boolean;
	productNameShort?: string | null;
	planTitle: TranslateResult;
	billingTimeframe?: TranslateResult | null;
	current?: boolean;
	isMonthlyPlan?: boolean;
	cartItemForPlan?: {
		product_slug: string;
	} | null;
	highlightLabel?: React.ReactNode | null;
	pricing: PricingMetaForGridPlan;
	storageAddOnsForPlan: ( AddOnMeta | null )[] | null;
};

// TODO clk: move to plans data store
export type PlansIntent =
	| 'plans-blog-onboarding'
	| 'plans-newsletter'
	| 'plans-link-in-bio'
	| 'plans-new-hosted-site'
	| 'plans-plugins'
	| 'plans-jetpack-app'
	| 'plans-jetpack-app-site-creation'
	| 'plans-import'
	| 'plans-woocommerce'
	| 'plans-paid-media'
	| 'plans-p2'
	| 'plans-default-wpcom'
	| 'plans-business-trial'
	| 'plans-videopress'
	| 'default';

interface Props {
	// allFeaturesList temporary until feature definitions are ported to calypso-products package
	allFeaturesList: FeatureList;
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans;
	useFreeTrialPlanSlugs: UseFreeTrialPlanSlugs;
	eligibleForFreeHostingTrial: boolean;
	selectedFeature?: string | null;
	term?: ( typeof TERMS_LIST )[ number ]; // defaults to monthly
	intent?: PlansIntent;
	selectedPlan?: PlanSlug;
	sitePlanSlug?: PlanSlug | null;
	hideEnterprisePlan?: boolean;
	isInSignup?: boolean;
	// whether plan is upgradable from current plan (used in logged-in state)
	usePlanUpgradeabilityCheck?: ( { planSlugs }: { planSlugs: PlanSlug[] } ) => {
		[ key: string ]: boolean;
	};
	showLegacyStorageFeature?: boolean;

	/**
	 * If the subdomain generation is unsuccessful we do not show the free plan
	 */
	isSubdomainNotGenerated?: boolean;
	storageAddOns: ( AddOnMeta | null )[] | null;
}

const usePlanTypesWithIntent = ( {
	intent,
	selectedPlan,
	sitePlanSlug,
	hideEnterprisePlan,
	isSubdomainNotGenerated = false,
}: Pick<
	Props,
	'intent' | 'selectedPlan' | 'sitePlanSlug' | 'hideEnterprisePlan' | 'isSubdomainNotGenerated'
> ): string[] => {
	const isEnterpriseAvailable = ! hideEnterprisePlan;
	const isBloggerAvailable =
		( selectedPlan && isBloggerPlan( selectedPlan ) ) ||
		( sitePlanSlug && isBloggerPlan( sitePlanSlug ) );

	let currentSitePlanType = null;
	if ( sitePlanSlug ) {
		currentSitePlanType = getPlan( sitePlanSlug )?.type;
	}

	const availablePlanTypes = [
		TYPE_FREE,
		...( isBloggerAvailable ? [ TYPE_BLOGGER ] : [] ),
		TYPE_PERSONAL,
		TYPE_PREMIUM,
		TYPE_BUSINESS,
		TYPE_ECOMMERCE,
		...( isEnterpriseAvailable ? [ TYPE_ENTERPRISE_GRID_WPCOM ] : [] ),
		TYPE_WOOEXPRESS_SMALL,
		TYPE_WOOEXPRESS_MEDIUM,
		TYPE_P2_PLUS,
	];

	let planTypes;
	switch ( intent ) {
		case 'plans-woocommerce':
			planTypes = [ TYPE_WOOEXPRESS_SMALL, TYPE_WOOEXPRESS_MEDIUM ];
			break;
		case 'plans-blog-onboarding':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
			break;
		case 'plans-newsletter':
		case 'plans-link-in-bio':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM ];
			break;
		case 'plans-new-hosted-site':
			planTypes = [ TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-import':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
			break;
		case 'plans-plugins':
			planTypes = [
				...( currentSitePlanType ? [ currentSitePlanType ] : [] ),
				TYPE_BUSINESS,
				TYPE_ECOMMERCE,
			];
			break;
		case 'plans-jetpack-app':
			planTypes = [ TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-jetpack-app-site-creation':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-paid-media':
			planTypes = [ TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-p2':
			planTypes = [ TYPE_FREE, TYPE_P2_PLUS ];
			break;
		case 'plans-default-wpcom':
			planTypes = [
				TYPE_FREE,
				...( isBloggerAvailable ? [ TYPE_BLOGGER ] : [] ),
				TYPE_PERSONAL,
				TYPE_PREMIUM,
				TYPE_BUSINESS,
				TYPE_ECOMMERCE,
				...( isEnterpriseAvailable ? [ TYPE_ENTERPRISE_GRID_WPCOM ] : [] ),
			];
			break;
		case 'plans-business-trial':
			planTypes = [
				TYPE_BUSINESS,
				...( isEnterpriseAvailable ? [ TYPE_ENTERPRISE_GRID_WPCOM ] : [] ),
			];
			break;
		case 'plans-videopress':
			planTypes = [ TYPE_PREMIUM, TYPE_BUSINESS ];
			break;
		default:
			planTypes = availablePlanTypes;
	}

	// Filters out the free plan  isSubdomainNotGenerated
	// This is because, on a free plan,  a custom domain can only redirect to the hosted site.
	// To effectively communicate this, a valid subdomain is necessary.
	if ( isSubdomainNotGenerated ) {
		planTypes = planTypes.filter( ( planType ) => planType !== TYPE_FREE );
	}

	return planTypes;
};

// TODO clk: move to plans data store
const useGridPlans = ( {
	usePricingMetaForGridPlans,
	useFreeTrialPlanSlugs,
	term = TERM_MONTHLY,
	intent,
	selectedPlan,
	sitePlanSlug,
	hideEnterprisePlan,
	isInSignup,
	usePlanUpgradeabilityCheck,
	eligibleForFreeHostingTrial,
	isSubdomainNotGenerated,
	storageAddOns,
}: Props ): Omit< GridPlan, 'features' >[] | null => {
	const freeTrialPlanSlugs = useFreeTrialPlanSlugs( {
		intent: intent ?? 'default',
		eligibleForFreeHostingTrial,
	} );
	const availablePlanSlugs = usePlansFromTypes( {
		planTypes: usePlanTypesWithIntent( {
			intent: 'default',
			selectedPlan,
			sitePlanSlug,
			hideEnterprisePlan,
			isSubdomainNotGenerated,
		} ),
		term,
		intent,
	} );
	const planSlugsForIntent = usePlansFromTypes( {
		planTypes: usePlanTypesWithIntent( {
			intent,
			selectedPlan,
			sitePlanSlug,
			hideEnterprisePlan,
			isSubdomainNotGenerated,
		} ),
		term,
		intent,
	} );
	const planUpgradeability = usePlanUpgradeabilityCheck?.( { planSlugs: availablePlanSlugs } );

	// only fetch highlights for the plans that are available for the intent
	const highlightLabels = useHighlightLabels( {
		intent,
		planSlugs: planSlugsForIntent,
		currentSitePlanSlug: sitePlanSlug,
		selectedPlan,
		planUpgradeability,
	} );

	// TODO: pricedAPIPlans to be queried from data-store package
	const pricedAPIPlans = Plans.usePlans();
	const pricingMeta = usePricingMetaForGridPlans( {
		planSlugs: availablePlanSlugs,
		storageAddOns,
	} );

	// Null return would indicate that we are still loading the data. No grid without grid plans.
	if ( ! pricingMeta || pricedAPIPlans.isFetching ) {
		return null;
	}

	return availablePlanSlugs.map( ( planSlug ) => {
		const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
		const planObject = pricedAPIPlans.data?.[ planSlug ];
		const isMonthlyPlan = isMonthly( planSlug );
		const availableForPurchase = !! ( isInSignup || planUpgradeability?.[ planSlug ] );
		const isCurrentPlan = sitePlanSlug ? isSamePlan( sitePlanSlug, planSlug ) : false;

		let tagline: TranslateResult = '';
		if ( 'plans-newsletter' === intent ) {
			tagline = planConstantObj.getNewsletterTagLine?.() ?? '';
		} else if ( 'plans-link-in-bio' === intent ) {
			tagline = planConstantObj.getLinkInBioTagLine?.() ?? '';
		} else if ( 'plans-blog-onboarding' === intent ) {
			tagline = planConstantObj.getBlogOnboardingTagLine?.() ?? '';
		} else {
			tagline = planConstantObj.getPlanTagline?.() ?? '';
		}

		const productNameShort =
			isWpcomEnterpriseGridPlan( planSlug ) && planConstantObj.getPathSlug
				? planConstantObj.getPathSlug()
				: planObject?.productNameShort ?? null;

		// cartItemForPlan done in line here as it's a small piece of logic to pass another selector for
		const cartItemForPlan =
			isWpComFreePlan( planSlug ) || isWpcomEnterpriseGridPlan( planSlug )
				? null
				: {
						product_slug: planSlug,
				  };

		const storageAddOnsForPlan =
			isBusinessPlan( planSlug ) || isEcommercePlan( planSlug ) ? storageAddOns : null;

		return {
			planSlug,
			freeTrialPlanSlug: freeTrialPlanSlugs?.[ planConstantObj.type ],
			isVisible: planSlugsForIntent.includes( planSlug ),
			tagline,
			availableForPurchase,
			productNameShort,
			planTitle: planConstantObj.getTitle?.() ?? '',
			billingTimeframe: planConstantObj.getBillingTimeFrame?.(),
			current: isCurrentPlan,
			isMonthlyPlan,
			cartItemForPlan,
			highlightLabel: highlightLabels[ planSlug ],
			pricing: pricingMeta[ planSlug ],
			storageAddOnsForPlan,
		};
	} );
};

export default useGridPlans;
