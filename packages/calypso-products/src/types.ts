import { PriceTierEntry } from './get-price-tier-for-units';
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
	JETPACK_PRODUCT_CATEGORIES,
	FEATURE_GROUP_GENERAL_FEATURES,
	FEATURE_GROUP_PERFORMANCE_BOOSTERS,
	FEATURE_GROUP_HIGH_AVAILABILITY,
	FEATURE_GROUP_DEVELOPER_TOOLS,
	FEATURE_GROUP_SECURITY_AND_SAFETY,
	FEATURE_GROUP_INNOVATIVE_TECHNOLOGIES,
	FEATURE_GROUP_THEMES_AND_CUSTOMIZATION,
	FEATURE_GROUP_MARKETING_GROWTH_AND_MONETIZATION_TOOLS,
	FEATURE_GROUP_SUPERIOR_COMMERCE_SOLUTIONS,
} from './constants';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement } from 'react';

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
	getPlanTagline?: () => string;
	getSubTitle?: () => TranslateResult;
	getPlanCompareFeatures?: (
		experiment?: string,
		options?: Record< string, string | boolean[] >
	) => Feature[];
	getSignupFeatures?: () => Feature[];
	getBlogSignupFeatures?: () => Feature[];
	getPortfolioSignupFeatures?: () => Feature[];
	getNewsletterDescription?: () => string;
	getNewsletterSignupFeatures?: () => Feature[];
	getNewsletterHighlightedFeatures?: () => Feature[];
	getLinkInBioDescription?: () => string;
	getLinkInBioSignupFeatures?: () => Feature[];
	getLinkInBioHighlightedFeatures?: () => Feature[];
	getPromotedFeatures?: () => Feature[];
	getPathSlug: () => string;
	getAnnualPlansOnlyFeatures?: () => string[];
	get2023PricingGridSignupWpcomFeatures?: () => Feature[];
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

export type SelectorProductFeaturesItem = {
	slug: string;
	icon?:
		| string
		| {
				icon: string;
				component?: ReactElement;
		  };
	text: TranslateResult;
	description?: TranslateResult;
	subitems?: SelectorProductFeaturesItem[];
	isHighlighted?: boolean;
	isDifferentiator?: boolean;
};

export interface JetpackTag {
	tag: string;
	label: TranslateResult;
}
export interface JetpackPlan extends Plan {
	getAnnualSlug?: () => JetpackPlanSlug;
	getMonthlySlug?: () => JetpackPlanSlug;
	getPlanCardFeatures?: () => Feature[];
	getPathSlug: () => string;
	getWhatIsIncluded: () => Array< TranslateResult >;
	getBenefits: () => Array< TranslateResult >;
	getRecommendedFor: () => Array< JetpackTag >;
}

export type IncompleteJetpackPlan = Partial< JetpackPlan > &
	Pick< JetpackPlan, 'group' | 'type' | 'getTitle' | 'getDescription' >;

export type JetpackProductCategory = typeof JETPACK_PRODUCT_CATEGORIES[ number ];

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
	price_tier_list?: Array< PriceTierEntry >;
	categories: JetpackProductCategory[];
	getFeatures?: () => Feature[];
	getProductId: () => number;
	getStoreSlug: () => ProductSlug;
}

export interface BillingTerm {
	term: typeof TERMS_LIST[ number ];
	getBillingTimeFrame: () => TranslateResult;
}

export type FeatureGroupSlug =
	| typeof FEATURE_GROUP_GENERAL_FEATURES
	| typeof FEATURE_GROUP_PERFORMANCE_BOOSTERS
	| typeof FEATURE_GROUP_HIGH_AVAILABILITY
	| typeof FEATURE_GROUP_DEVELOPER_TOOLS
	| typeof FEATURE_GROUP_SECURITY_AND_SAFETY
	| typeof FEATURE_GROUP_INNOVATIVE_TECHNOLOGIES
	| typeof FEATURE_GROUP_THEMES_AND_CUSTOMIZATION
	| typeof FEATURE_GROUP_SUPERIOR_COMMERCE_SOLUTIONS
	| typeof FEATURE_GROUP_MARKETING_GROWTH_AND_MONETIZATION_TOOLS;

export type FeatureGroup = {
	slug: FeatureGroupSlug;
	getTitle: () => string;
	get2023PricingGridSignupWpcomFeatures: () => Feature[];
};
export type FeatureGroupMap = Record< FeatureGroupSlug, FeatureGroup >;

export type Plan = BillingTerm & {
	group: typeof GROUP_WPCOM | typeof GROUP_JETPACK;
	type: string;
	availableFor?: ( plan: PlanSlug ) => boolean;
	getSignupCompareAvailableFeatures?: () => string[];
	get2023PricingGridSignupWpcomFeatures?: () => Feature[];
	get2023PricingGridSignupJetpackFeatures?: () => Feature[];
	get2023PricingGridSignupStorageOptions?: () => Feature[];
	getProductId: () => number;
	getPathSlug?: () => string;
	getStoreSlug: () => PlanSlug;
	getTitle: () => TranslateResult;
	getDescription: () => TranslateResult;
	getShortDescription?: () => TranslateResult;
	getFeaturedDescription?: () => TranslateResult;
	getLightboxDescription?: () => TranslateResult;
	getProductsIncluded?: () => ReadonlyArray< string >;
	getWhatIsIncluded?: () => Array< TranslateResult >;
	getBenefits?: () => Array< TranslateResult >;
	getRecommendedFor?: () => Array< JetpackTag >;
	getTagline?: () => TranslateResult;
	getPlanCardFeatures?: () => Feature[];
	getCancellationFeatureList?: () => CancellationFeatureLists;
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

export interface CancellationFeatureLists {
	monthly: CancellationFeatureList;
	yearly: CancellationFeatureList;
	withDomain: CancellationFeatureList;
}

export interface CancellationFeatureList {
	featureList: string[];
	andMore: boolean;
}
