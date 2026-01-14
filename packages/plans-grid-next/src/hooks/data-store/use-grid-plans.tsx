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
	TYPE_WOO_HOSTED_BASIC,
	TYPE_WOO_HOSTED_PRO,
	getPlan,
	isBloggerPlan,
	applyTestFiltersToPlansList,
	isMonthly,
	isWpcomEnterpriseGridPlan,
	TERM_MONTHLY,
	isWpComFreePlan,
	type PlanSlug,
	type PlanType,
	isBusinessPlan,
	isEcommercePlan,
	TYPE_P2_PLUS,
	isPremiumPlan,
	isFreePlan,
	isPersonalPlan,
	planHasFeature,
	getPlanClass,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { isSamePlan } from '../../lib/is-same-plan';
import { UseGridPlansParams, UseGridPlansType } from './types';
import useHighlightLabels from './use-highlight-labels';
import usePlansFromTypes from './use-plans-from-types';
import type { HiddenPlans, PlansIntent } from '../../types';
import type { TranslateResult } from 'i18n-calypso';

export type UseFreeTrialPlanSlugs = ( {
	intent,
	eligibleForFreeHostingTrial,
}: {
	intent: PlansIntent;
	eligibleForFreeHostingTrial?: boolean;
} ) => {
	[ Type in PlanType ]?: PlanSlug;
};

const isGridPlanVisible = ( {
	hiddenPlans: {
		hideFreePlan,
		hidePersonalPlan,
		hidePremiumPlan,
		hideBusinessPlan,
		hideEcommercePlan,
	} = {},
	isDisplayingPlansNeededForFeature,
	gridPlanSlug,
	planSlugsForIntent,
	selectedPlan,
	selectedFeature,
	currentPlanSlug,
}: {
	hiddenPlans?: HiddenPlans;
	isDisplayingPlansNeededForFeature?: boolean;
	gridPlanSlug: PlanSlug;
	planSlugsForIntent: PlanSlug[];
	selectedPlan?: PlanSlug;
	selectedFeature?: string | null;
	currentPlanSlug?: PlanSlug;
} ): boolean => {
	let isVisible = planSlugsForIntent.includes( gridPlanSlug );

	if ( isDisplayingPlansNeededForFeature ) {
		// Feature-based filtering: Show the plan being evaluated if it includes the selected feature,
		// or if it's the user's current plan (ignoring billing term length)
		if ( selectedFeature && ! selectedPlan ) {
			const hasFeature = planHasFeature( gridPlanSlug, selectedFeature );
			const isCurrentPlan =
				currentPlanSlug && getPlanClass( currentPlanSlug ) === getPlanClass( gridPlanSlug );
			isVisible = isVisible && ( isCurrentPlan || hasFeature );
		}
		// Plan-tier-based filtering: When a specific plan is pre-selected,
		// show that plan tier and all higher tiers (e.g., if Premium is selected, show Premium + Business + Commerce)
		else if ( selectedPlan ) {
			if ( isEcommercePlan( selectedPlan ) ) {
				isVisible = isEcommercePlan( gridPlanSlug );
			}

			if ( isBusinessPlan( selectedPlan ) ) {
				isVisible = isBusinessPlan( gridPlanSlug ) || isEcommercePlan( gridPlanSlug );
			}

			if ( isPremiumPlan( selectedPlan ) ) {
				isVisible =
					isPremiumPlan( gridPlanSlug ) ||
					isBusinessPlan( gridPlanSlug ) ||
					isEcommercePlan( gridPlanSlug );
			}
		}
	}

	if (
		( hideFreePlan && isFreePlan( gridPlanSlug ) ) ||
		( hidePersonalPlan && isPersonalPlan( gridPlanSlug ) ) ||
		( hidePremiumPlan && isPremiumPlan( gridPlanSlug ) ) ||
		( hideBusinessPlan && isBusinessPlan( gridPlanSlug ) ) ||
		( hideEcommercePlan && isEcommercePlan( gridPlanSlug ) )
	) {
		isVisible = false;
	}

	return isVisible;
};

export const usePlanTypesWithIntent = ( {
	intent,
	selectedPlan,
	siteId,
	hiddenPlans: { hideEnterprisePlan } = {},
	isSubdomainNotGenerated = false,
}: Pick<
	UseGridPlansParams,
	'intent' | 'selectedPlan' | 'siteId' | 'hiddenPlans' | 'isSubdomainNotGenerated'
> ): string[] => {
	const { planSlug: sitePlanSlug } = Plans.useCurrentPlan( { siteId } ) || {};
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
		TYPE_WOO_HOSTED_BASIC,
		TYPE_WOO_HOSTED_PRO,
		TYPE_P2_PLUS,
	];

	let planTypes;
	switch ( intent ) {
		/* START: Guided Signup intents. See: pdDR7T-1xi-p2 */
		case 'plans-guided-segment-blogger':
		case 'plans-guided-segment-nonprofit':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
			break;
		case 'plans-guided-segment-consumer-or-business':
			planTypes = [ TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
			break;
		case 'plans-guided-segment-merchant':
		case 'plans-guided-segment-developer-or-agency':
			planTypes = [ TYPE_BUSINESS, TYPE_ECOMMERCE, TYPE_ENTERPRISE_GRID_WPCOM ];
			break;
		/* END: Guided signup intents. END */
		case 'plans-woocommerce':
			planTypes = [ TYPE_WOOEXPRESS_SMALL, TYPE_WOOEXPRESS_MEDIUM ];
			break;
		case 'plans-blog-onboarding':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
			break;
		case 'plans-newsletter':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM ];
			break;
		case 'plans-new-hosted-site':
			planTypes = [ TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-new-hosted-site-business-only':
			planTypes = [ TYPE_BUSINESS ];
			break;
		case 'plans-ai-assembler-free-trial':
			planTypes = [ TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
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
		case 'plans-upgrade': {
			// Show current plan plus all higher-tier plans (upgrade options only)
			const upgradePlanTypes = [
				TYPE_FREE,
				TYPE_PERSONAL,
				TYPE_PREMIUM,
				TYPE_BUSINESS,
				TYPE_ECOMMERCE,
			];
			if ( isEnterpriseAvailable ) {
				upgradePlanTypes.push( TYPE_ENTERPRISE_GRID_WPCOM );
			}

			// Find the index of the current plan in the hierarchy
			const currentPlanIndex = currentSitePlanType
				? upgradePlanTypes.findIndex( ( planType ) => planType === currentSitePlanType )
				: -1;

			if ( currentPlanIndex >= 0 ) {
				// Show current plan and all plans after it (higher tiers)
				planTypes = upgradePlanTypes.slice( currentPlanIndex );
			} else {
				// If current plan not found or no current plan, show all plans
				planTypes = upgradePlanTypes;
			}
			break;
		}
		case 'plans-jetpack-app':
			planTypes = [ TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-jetpack-app-site-creation':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-p2':
			planTypes = [ TYPE_FREE ];

			// 2024-04-02 Disable upgrade to P2+
			// only include P2+ if it is the current plan
			if ( TYPE_P2_PLUS === currentSitePlanType ) {
				planTypes.push( TYPE_P2_PLUS );
			}

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
			planTypes = [ TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-videopress':
			planTypes = [ TYPE_PREMIUM, TYPE_BUSINESS ];
			break;
		case 'plans-affiliate':
			planTypes = [ TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-site-selected-legacy':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-playground':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-playground-premium':
			// This plan intent is currently not utilized but will be soon
			planTypes = [ TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-wordpress-hosting':
			planTypes = [ TYPE_BUSINESS, TYPE_ECOMMERCE, TYPE_ENTERPRISE_GRID_WPCOM ];
			break;
		case 'plans-website-builder':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
			break;
		case 'plans-woo-hosted':
			planTypes = [ TYPE_WOO_HOSTED_BASIC, TYPE_WOO_HOSTED_PRO ];
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
const useGridPlans: UseGridPlansType = ( {
	useCheckPlanAvailabilityForPurchase,
	useFreeTrialPlanSlugs,
	term = TERM_MONTHLY,
	intent,
	selectedPlan,
	selectedFeature,
	hiddenPlans,
	isInSignup,
	eligibleForFreeHostingTrial,
	isSubdomainNotGenerated,
	coupon,
	siteId,
	isDisplayingPlansNeededForFeature,
	highlightLabelOverrides,
	isDomainOnlySite,
	reflectStorageSelectionInPlanPrices,
} ) => {
	const freeTrialPlanSlugs = useFreeTrialPlanSlugs?.( {
		intent: intent ?? 'default',
		eligibleForFreeHostingTrial,
	} );
	const availablePlanSlugs = usePlansFromTypes( {
		planTypes: usePlanTypesWithIntent( {
			intent: 'default',
			selectedPlan,
			siteId,
			hiddenPlans,
			isSubdomainNotGenerated,
		} ),
		term,
		intent,
	} );
	const planSlugsForIntent = usePlansFromTypes( {
		planTypes: usePlanTypesWithIntent( {
			intent,
			selectedPlan,
			siteId,
			hiddenPlans,
			isSubdomainNotGenerated,
		} ),
		term,
		intent,
	} );

	const { planSlug: sitePlanSlug, purchaseId } = Plans.useCurrentPlan( { siteId } ) || {};

	const plansAvailabilityForPurchase = useCheckPlanAvailabilityForPurchase( {
		planSlugs: availablePlanSlugs,
		siteId,
		shouldIgnorePlanOwnership: !! purchaseId, // Ignore plan ownership only if the site is on a paid plan
	} );

	// only fetch highlights for the plans that are available for the intent

	const highlightLabels = useHighlightLabels( {
		intent,
		planSlugs: planSlugsForIntent,
		currentSitePlanSlug: sitePlanSlug,
		selectedPlan,
		plansAvailabilityForPurchase,
		highlightLabelOverrides,
		isDomainOnlySite: isDomainOnlySite || false,
	} );

	// TODO: pricedAPIPlans to be queried from data-store package
	const pricedAPIPlans = Plans.usePlans( { coupon } );
	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		planSlugs: availablePlanSlugs,
		coupon,
		siteId,
		useCheckPlanAvailabilityForPurchase,
		reflectStorageSelectionInPlanPrices,
	} );

	// Null return would indicate that we are still loading the data. No grid without grid plans.
	if ( ! pricingMeta || pricedAPIPlans.isLoading ) {
		return null;
	}

	return availablePlanSlugs.map( ( planSlug ) => {
		const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
		const planObject = pricedAPIPlans.data?.[ planSlug ];
		const isMonthlyPlan = isMonthly( planSlug );
		/**
		 * TODO: checking isInSignup below seems redundant. We should be able to remove it.
		 * - double check whether Stepper does something else with a site ID and current plan
		 * while still in Signup flow
		 */
		const availableForPurchase = !! ( isInSignup || plansAvailabilityForPurchase?.[ planSlug ] );
		const isCurrentPlan = sitePlanSlug ? isSamePlan( sitePlanSlug, planSlug ) : false;

		let tagline: TranslateResult = '';
		if ( 'plans-newsletter' === intent ) {
			tagline = planConstantObj.getNewsletterTagLine?.() ?? '';
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

		const isVisible = isGridPlanVisible( {
			gridPlanSlug: planSlug,
			planSlugsForIntent,
			selectedPlan,
			selectedFeature,
			currentPlanSlug: sitePlanSlug,
			hiddenPlans,
			isDisplayingPlansNeededForFeature,
		} );
		const freeTrialPlanSlug = freeTrialPlanSlugs?.[ planConstantObj.type ];

		return {
			planSlug,
			freeTrialPlanSlug,
			isVisible,
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
		};
	} );
};

export default useGridPlans;
