import { applyTestFiltersToPlansList, PlanSlug } from '@automattic/calypso-products';
import { FeatureObject } from 'calypso/lib/plans/features-list';
import type { PricedAPIPlan } from '@automattic/data-stores';

export type TransformedFeatureObject = FeatureObject & {
	availableForCurrentPlan: boolean;
	availableOnlyForAnnualPlans: boolean;
};

export type PlanProperties = {
	billingPeriod?: number;
	cartItemForPlan: {
		product_slug: string;
	} | null;
	currencyCode: string | null;
	features: TransformedFeatureObject[];
	jpFeatures: TransformedFeatureObject[];
	isPlaceholder?: boolean;
	isVisible: boolean;
	planConstantObj: ReturnType< typeof applyTestFiltersToPlansList >;
	planName: PlanSlug;
	planObject: PricedAPIPlan | undefined;
	product_name_short: string;
	hideMonthly?: boolean;
	rawPrice: number | null;
	rawPriceForMonthlyPlan: number | null;
	relatedMonthlyPlan: null | PricedAPIPlan | undefined;
	isMonthlyPlan: boolean;
	tagline: string;
	storageOptions: string[];
	availableForPurchase: boolean;
	current?: boolean;
	showMonthlyPrice: boolean;
	planActionOverrides?: PlanActionOverrides;
};

export interface PlanActionOverrides {
	loggedInFreePlan?: {
		callback: () => void;
		text: string;
	};
}
