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
	 * When true, use the long/expanded feature set for the plans differentiators experiment.
	 */
	useLongSetFeatures?: boolean;
	/**
	 * When true, use the stacked (incremental) feature set for the long_set_stacked variant.
	 */
	useLongSetStackedFeatures?: boolean;
	/**
	 * When true, use the stacked (incremental) feature set for the short_set_stacked variant.
	 */
	useShortSetStackedFeatures?: boolean;
	/**
	 * When true, use the var5 feature set (getVar5StackedSignupWpcomFeatures).
	 */
	useVar5Features?: boolean;
	/**
	 * When true, the user is in an experiment variant (not control).
	 */
	isExperimentVariant?: boolean;
}

export type UseGridPlansType = (
	params: UseGridPlansParams
) => Omit< GridPlan, 'features' >[] | null;
