/**
 * Internal dependencies
 */
import * as features from './constants/features';

/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
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
	TYPES_LIST,
	PERIOD_LIST,
} from './constants';

const featureValues = Object.values( features );

export type Feature = typeof featureValues[ number ];

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
		experiment: string,
		options: Record< string, unknown >
	) => TranslateResult[];
	getSignupFeatures?: () => Feature[];
	getBlogSignupFeatures?: () => Feature[];
	getPortfolioSignupFeatures?: () => Feature[];
}

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
}

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
}

export interface Plan {
	group: typeof GROUP_WPCOM | typeof GROUP_JETPACK;
	type: typeof TYPES_LIST[ number ];
	term: typeof TERMS_LIST[ number ];
	availableFor: ( plan: PlanSlug ) => boolean;
	getProductId: () => number;
	getPathSlug: () => string;
	getStoreSlug: () => PlanSlug;
	getBillingTimeFrame: () => TranslateResult;
	getTitle: () => TranslateResult;
	getDescription: () => TranslateResult;
	getTagline: () => TranslateResult;
	getHiddenFeatures?: () => Feature[];
	getInferiorHiddenFeatures?: () => Feature[];
}
