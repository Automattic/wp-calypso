import { FeatureList, PlanSlug, TERMS_LIST } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { TranslateResult } from 'i18n-calypso';
import { GridPlan, HiddenPlans, PlansIntent } from '../../types';
import { UseFreeTrialPlanSlugs } from './use-grid-plans';

export interface UseGridPlansParams {
	allFeaturesList: FeatureList; // Temporary until feature definitions are ported to calypso-products package
	coupon?: string;
	eligibleForFreeHostingTrial?: boolean;
	hasRedeemedDomainCredit?: boolean;
	hiddenPlans?: HiddenPlans;
	hideCurrentPlan?: boolean;
	intent?: PlansIntent;
	isDisplayingPlansNeededForFeature?: boolean;
	isInSignup?: boolean;
	isSubdomainNotGenerated?: boolean; // If the subdomain generation is unsuccessful we do not show the free plan
	selectedFeature?: string | null;
	selectedPlan?: PlanSlug;
	showLegacyStorageFeature?: boolean;
	siteId?: number | null;
	term?: ( typeof TERMS_LIST )[ number ]; // defaults to monthly
	useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase;
	useFreeTrialPlanSlugs?: UseFreeTrialPlanSlugs;
	/**
	 * Provide a map of plan slug keyed strings to display as the highlight label on top of each plan.
	 */
	highlightLabelOverrides?: { [ K in PlanSlug ]?: TranslateResult };
	/**
	 * Used to hide the "Your Plan" label for domain-only sites
	 */
	isDomainOnlySite?: boolean;
	/**
	 * Determine if storage add-on products should be combined with plan costs when
	 * calculating prices.
	 */
	reflectStorageSelectionInPlanPrices?: boolean;
	/**
	 * When true, use the focused_comparison feature set (getLongSetSignupWpcomFeatures).
	 */
	useFocusedComparisonFeatures?: boolean;
	/**
	 * When true, use the focused_more_premium / focused_new_copy feature set
	 * (getVar41MorePremiumSignupWpcomFeatures) for the plans differentiators experiment.
	 */
	useVar41MorePremiumFeatures?: boolean;
	/**
	 * When true, use the focused_no_ai feature set for the plans differentiators experiment.
	 */
	useVar42NoAiFeatures?: boolean;
	/**
	 * When true, show plan-scoped feature pills (focused_more_premium, focused_new_copy, focused_no_ai only).
	 * focused_no_ai suppresses AI-labeled pills only.
	 */
	showPricingDifferentiationFeaturePills?: boolean;
	/**
	 * When true, use the focused_new_copy taglines for plan headers.
	 * Applies to: focused_new_copy only.
	 */
	useFocusedNewCopyTaglines?: boolean;
	/**
	 * When true, the user is in an experiment variant (not control).
	 */
	isExperimentVariant?: boolean;
}

export type UseGridPlansType = (
	params: UseGridPlansParams
) => Omit< GridPlan, 'features' >[] | null;
