import { FeatureList, PlanSlug, TERMS_LIST } from '@automattic/calypso-products';
import { AddOnMeta, Plans } from '@automattic/data-stores';
import { GridPlan, HiddenPlans, PlansIntent } from '../../types';
import { UseFreeTrialPlanSlugs } from './use-grid-plans';

export interface UseGridPlansParams {
	allFeaturesList: FeatureList; // Temporary until feature definitions are ported to calypso-products package
	coupon?: string;
	eligibleForFreeHostingTrial?: boolean;
	hasRedeemedDomainCredit?: boolean;
	hiddenPlans?: HiddenPlans;
	intent?: PlansIntent;
	isDisplayingPlansNeededForFeature?: boolean;
	isInSignup?: boolean;
	isSubdomainNotGenerated?: boolean; // If the subdomain generation is unsuccessful we do not show the free plan
	selectedFeature?: string | null;
	selectedPlan?: PlanSlug;
	showLegacyStorageFeature?: boolean;
	siteId?: number | null;
	storageAddOns: ( AddOnMeta | null )[];
	term?: ( typeof TERMS_LIST )[ number ]; // defaults to monthly
	useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase;
	useFreeTrialPlanSlugs?: UseFreeTrialPlanSlugs;
}

export type UseGridPlansType = (
	params: UseGridPlansParams
) => Omit< GridPlan, 'features' >[] | null;
