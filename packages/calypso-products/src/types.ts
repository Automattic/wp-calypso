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
} from './constants';

export type Features = keyof typeof features;

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
	getSignupFeatures?: () => Features[];
	getBlogSignupFeatures?: () => Features[];
	getPortfolioSignupFeatures?: () => Features[];
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

export interface JetpackProduct {
	title: TranslateResult;
	description: TranslateResult;
	forceRadios?: boolean;
	hasPromo: boolean;
	id: ProductSlug;
	link: {
		label: TranslateResult;
		props: {
			location: string;
			slug: string;
		};
		url: string;
	};
	slugs: ProductSlug[];
	options: {
		yearly: ProductSlug[];
		monthly: ProductSlug[];
	};
	optionShortNames: () => Record< ProductSlug, TranslateResult >;
	optionActionButtonNames?: () => Record< ProductSlug, TranslateResult >;
	optionDisplayNames: () => Record< ProductSlug, TranslateResult >;
	optionDescriptions: () => Record< ProductSlug, TranslateResult >;
	optionShortNamesCallback?: ( arg0: Record< string, unknown > ) => TranslateResult;
	optionsLabelCallback?: ( arg0: Record< string, unknown > ) => TranslateResult;
	optionsLabel: TranslateResult;
}

export interface JetpackPlan extends Plan {
	getAnnualSlug?: () => JetpackPlanSlug;
	getMonthlySlug?: () => JetpackPlanSlug;
	getPlanCardFeatures?: () => Features[];
}

// All
export type ProductSlug = WPComProductSlug | JetpackProductSlug;
export type PlanSlug = WPComPlanSlug | JetpackPlanSlug;
export type PurchasableItemSlug = WPComPurchasableItemSlug | JetpackPurchasableItemSlug;

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
	getHiddenFeatures?: () => Features[];
	getInferiorHiddenFeatures?: () => Features[];
}
