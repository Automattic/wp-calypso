import { applyTestFiltersToPlansList, PlanSlug } from '@automattic/calypso-products';
import { FeatureObject } from 'calypso/lib/plans/features-list';
import type { TranslateResult } from 'i18n-calypso';

export type TransformedFeatureObject = FeatureObject & {
	availableForCurrentPlan: boolean;
	availableOnlyForAnnualPlans: boolean;
};

export type PlanProperties = {
	billingPeriod?: number;
	cartItemForPlan: {
		product_slug: string;
	} | null;
	currencyCode?: string | null;
	features: TransformedFeatureObject[];
	jpFeatures: TransformedFeatureObject[];
	isPlaceholder?: boolean;
	isVisible: boolean;
	planConstantObj: ReturnType< typeof applyTestFiltersToPlansList >;
	planName: PlanSlug;
	product_name_short: string;
	rawPrice: number | null;
	isMonthlyPlan: boolean;
	tagline: string;
	storageOptions: string[];
	availableForPurchase: boolean;
	current?: boolean;
	planActionOverrides?: PlanActionOverrides;
};

export interface PlanActionOverrides {
	loggedInFreePlan?: {
		callback: () => void;
		text: TranslateResult;
	};
}

export type GridSize = 'small' | 'medium' | 'large';
