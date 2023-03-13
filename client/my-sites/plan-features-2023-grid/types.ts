import { applyTestFiltersToPlansList } from '@automattic/calypso-products';
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
	discountPrice: number | null;
	features: TransformedFeatureObject[];
	jpFeatures: TransformedFeatureObject[];
	isLandingPage?: boolean;
	isPlaceholder?: boolean;
	planConstantObj: ReturnType< typeof applyTestFiltersToPlansList >;
	planName: string;
	planObject: PricedAPIPlan | undefined;
	product_name_short: string;
	hideMonthly?: boolean;
	rawPrice: number | null;
	maybeDiscountedFullTermPrice: number | null;
	rawPriceForMonthlyPlan: number | null;
	relatedMonthlyPlan: null | PricedAPIPlan | undefined;
	annualPricePerMonth: number | null;
	isMonthlyPlan: boolean;
	tagline: string;
	storageOptions: string[];
	availableForPurchase: boolean;
	current?: boolean;
	showMonthlyPrice: boolean;
};
