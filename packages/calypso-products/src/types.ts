import type {
	GROUP_JETPACK,
	GROUP_WPCOM,
	WPCOM_PRODUCTS,
	WPCOM_PLANS,
	PLAN_JETPACK_FREE,
	JETPACK_PRODUCTS_LIST,
	JETPACK_LEGACY_PLANS,
	JETPACK_RESET_PLANS,
	TERMS_LIST,
	PERIOD_LIST,
} from './constants';
import type { TranslateResult } from 'i18n-calypso';

export type Feature = string;

// WPCom
export type WPComProductSlug = typeof WPCOM_PRODUCTS[ number ];
export type WPComPlanSlug = typeof WPCOM_PLANS[ number ];
export type WPComPurchasableItemSlug = WPComProductSlug | WPComPlanSlug;

export interface WPComPlan extends Plan {
	getAudience?: () => TranslateResult;
	getBlogAudience?: () => TranslateResult;
	getPortfolioAudience?: () => TranslateResult;
	getStoreAudience?: () => TranslateResult;
	getPlanCompareFeatures?: (
		experiment?: string,
		options?: Record< string, string | boolean[] >
	) => TranslateResult[];
	getSignupFeatures?: () => Feature[];
	getBlogSignupFeatures?: () => Feature[];
	getPortfolioSignupFeatures?: () => Feature[];
	getPromotedFeatures?: () => Feature[];
	getPathSlug: () => string;
}

export type IncompleteWPcomPlan = Partial< WPComPlan > &
	Pick< WPComPlan, 'group' | 'type' | 'getTitle' | 'getDescription' >;

// Jetpack
export type JetpackProductSlug = typeof JETPACK_PRODUCTS_LIST[ number ];
export type JetpackLegacyPlanSlug = typeof JETPACK_LEGACY_PLANS[ number ];
export type JetpackResetPlanSlug = typeof JETPACK_RESET_PLANS[ number ];
export type JetpackPlanSlug =
	| typeof PLAN_JETPACK_FREE
	| JetpackLegacyPlanSlug
	| JetpackResetPlanSlug;
export type JetpackPurchasableItemSlug =
	| JetpackProductSlug
	| Exclude< JetpackPlanSlug, typeof PLAN_JETPACK_FREE >;

export interface JetpackPlan extends Plan {
	getAnnualSlug?: () => JetpackPlanSlug;
	getMonthlySlug?: () => JetpackPlanSlug;
	getPlanCardFeatures?: () => Feature[];
	getPathSlug: () => string;
}

export type IncompleteJetpackPlan = Partial< JetpackPlan > &
	Pick< JetpackPlan, 'group' | 'type' | 'getTitle' | 'getDescription' >;

// All
export type ProductSlug = WPComProductSlug | JetpackProductSlug;
export type PlanSlug = WPComPlanSlug | JetpackPlanSlug;
export type PurchasableItemSlug = WPComPurchasableItemSlug | JetpackPurchasableItemSlug;

export interface Product {
	product_name: TranslateResult;
	product_slug: ProductSlug;
	type: ProductSlug;
	term: typeof TERMS_LIST[ number ];
	bill_period: typeof PERIOD_LIST[ number ];
	getFeatures?: () => Feature[];
	getProductId: () => number;
	getStoreSlug: () => ProductSlug;
}

export interface BillingTerm {
	term: typeof TERMS_LIST[ number ];
	getBillingTimeFrame: () => TranslateResult;
}

export type Plan = BillingTerm & {
	group: typeof GROUP_WPCOM | typeof GROUP_JETPACK;
	type: string;
	availableFor?: ( plan: PlanSlug ) => boolean;
	getSignupCompareAvailableFeatures?: () => string[];
	getProductId: () => number;
	getPathSlug?: () => string;
	getStoreSlug: () => PlanSlug;
	getTitle: () => TranslateResult;
	getDescription: () => TranslateResult;
	getShortDescription?: () => TranslateResult;
	getTagline?: () => TranslateResult;

	/**
	 * Features that are included as part of this plan.
	 *
	 * NOTE: Some parts of Calypso use the result of this method
	 * to determine what a given plan *may* be capable of doing
	 * before verifying with an API.
	 */
	getIncludedFeatures?: () => Feature[];

	/**
	 * Features that are superseded by another feature included in this plan.
	 *
	 * Example: if a plan has 1TB of storage space,
	 * a feature for 20GB of storage space would be inferior to it.
	 */
	getInferiorFeatures?: () => Feature[];
};

export type WithSnakeCaseSlug = { product_slug: string };
export type WithCamelCaseSlug = { productSlug: string };

export interface PlanMatchesQuery {
	term?: string;
	group?: string;
	type?: string;
}
