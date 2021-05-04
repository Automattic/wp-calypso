/* eslint-disable wpcalypso/import-docblock */
/**
 * Type dependencies
 */
import type { TranslateResult } from 'i18n-calypso';
import type {
	GROUP_JETPACK,
	GROUP_WPCOM,
	PLAN_JETPACK_FREE,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	JETPACK_PRODUCTS_LIST,
	JETPACK_LEGACY_PLANS,
	JETPACK_RESET_PLANS,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
} from './constants';

// WPCom
export type WPComProductSlug = typeof PRODUCT_WPCOM_SEARCH | typeof PRODUCT_WPCOM_SEARCH_MONTHLY;

// Jetpack
export type JetpackLegacyPlanSlugs = typeof JETPACK_LEGACY_PLANS[ number ];
export type JetpackResetPlanSlugs = typeof JETPACK_RESET_PLANS[ number ];
export type JetpackPlanSlugs =
	| typeof PLAN_JETPACK_FREE
	| JetpackLegacyPlanSlugs
	| JetpackResetPlanSlugs;
export type JetpackProductSlug = typeof JETPACK_PRODUCTS_LIST[ number ];
export type JetpackPurchasableItem =
	| JetpackLegacyPlanSlugs
	| JetpackResetPlanSlugs
	| JetpackProductSlug;

export type ProductSlug = JetpackProductSlug | WPComProductSlug;
export type Plan = {
	group: typeof GROUP_WPCOM | typeof GROUP_JETPACK;
	type: string;
	term: typeof TERM_ANNUALLY | typeof TERM_BIENNIALLY | typeof TERM_MONTHLY;
	getBillingTimeFrame: () => TranslateResult;
	getTitle: ( variation?: string ) => TranslateResult;
	getDescription: ( variation?: string ) => TranslateResult;
	getTagline?: ( featuresOrCROVariation?: string[] | string ) => TranslateResult;
	getButtonLabel?: ( variation?: string ) => TranslateResult;
	getAnnualSlug?: () => JetpackPlanSlugs | string;
	getMonthlySlug?: () => JetpackPlanSlugs | string;
	getAudience?: () => TranslateResult;
	getBlogAudience?: () => TranslateResult;
	getPortfolioAudience?: () => TranslateResult;
	getStoreAudience?: () => TranslateResult;
	getProductId: () => number;
	getStoreSlug: () => JetpackPlanSlugs | string;
	getPathSlug?: () => string;
	getPlanCompareFeatures?: () => string[];
	getPlanCardFeatures?: (
		variation?: string
	) => JetpackPlanCardFeature[] | JetpackPlanCardFeatureSection;
	getSignupFeatures?: () => string[];
	getBlogSignupFeatures?: () => string[];
	getPortfolioSignupFeatures?: () => string[];
	getHiddenFeatures?: () => string[];
	getInferiorHiddenFeatures?: () => string[];
};
export type ProductTranslations = {
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
};

export type JetpackPlanCardFeature = symbol | [ symbol, symbol[] ];
export type JetpackPlanCardFeatureSection = Record< symbol, JetpackPlanCardFeature[] >;
