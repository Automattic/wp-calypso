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
	 * When true, use the no-AI feature set for the rolled-out pricing differentiation cohort.
	 */
	useVar42NoAiFeatures?: boolean;
	/**
	 * When true, show plan-scoped feature pills. AI-labeled pills are suppressed.
	 */
	showPricingDifferentiationFeaturePills?: boolean;
	/**
	 * When true, use the focused_new_copy taglines for plan headers.
	 */
	useFocusedNewCopyTaglines?: boolean;
	/**
	 * When true, use the pricing grid redesign taglines for plan headers.
	 */
	usePlansGridRedesignNewDescription?: boolean;
	/**
	 * When true, use cohort feature lists and comparison grid copy.
	 */
	isExperimentVariant?: boolean;
	/**
	 * Renewal-pricing experiment flag, threaded to the pricing hook so the current
	 * plan's headline matches the renewal-vs-intro treatment.
	 */
	showBillingDescriptionForIncreasedRenewalPrice?: string | null;
}

export type UseGridPlansType = (
	params: UseGridPlansParams
) => Omit< GridPlan, 'features' >[] | null;
