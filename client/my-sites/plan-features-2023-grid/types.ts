import { applyTestFiltersToPlansList, PlanSlug } from '@automattic/calypso-products';
import { FeatureObject } from 'calypso/lib/plans/features-list';
import type { DomainSuggestion } from '@automattic/data-stores';
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

// FIXME:
// As raised in https://github.com/Automattic/wp-calypso/pull/79678#discussion_r1273391589,
// this name is not ideal for various reasons. "Single" is redundant, the data structure itself
// also doesn't convey any restriction about whether it can only holds a `DomainSuggestion` from a free domain or not.
// We need a better naming for the fact that it's a single DomainSuggestion together with a loading flag since
// fetching for a domain suggestion is an async request.
export type SingleFreeDomainSuggestion = {
	isLoading: boolean;
	entry?: DomainSuggestion;
};

export interface PlanActionOverrides {
	loggedInFreePlan?: {
		callback: () => void;
		text: TranslateResult;
	};
}
