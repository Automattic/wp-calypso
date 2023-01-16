import { applyTestFiltersToPlansList } from '@automattic/calypso-products';
import { FeatureObject } from 'calypso/lib/plans/features-list';
import type { PricedAPIPlan } from '@automattic/data-stores';

export type TransformedFeatureObject = FeatureObject & { availableForCurrentPlan: boolean };

export type PlanProperties = {
	cartItemForPlan: {
		product_slug: string;
	} | null;
	currencyCode: string | null;
	discountPrice: number | null;
	features: PlanFeature[];
	jpFeatures: PlanFeature[];
	isLandingPage?: boolean;
	isPlaceholder?: boolean;
	planConstantObj: ReturnType< typeof applyTestFiltersToPlansList >;
	planName: string;
	planObject: PricedAPIPlan | undefined;
	product_name_short: string;
	hideMonthly?: boolean;
	rawPrice: number | null;
	rawPriceAnnual: number | null;
	rawPriceForMonthlyPlan: number | null;
	relatedMonthlyPlan: null | PricedAPIPlan | undefined;
	annualPricePerMonth: number | null;
	isMonthlyPlan: boolean;
	tagline: string;
	storageOptions: string[];
};

export interface PlanFeature {
	availableForCurrentPlan?: boolean;
	availableOnlyForAnnualPlans?: boolean;
	getSlug: () => string;
	getTitle: ( name?: string ) => React.ReactNode;
	getDescription?: () => React.ReactNode;
}
