import {
	type GROUP_JETPACK,
	type GROUP_WPCOM,
	type GROUP_P2,
	type WPCOM_PRODUCTS,
	type WPCOM_PLANS,
	type PLAN_JETPACK_FREE,
	type JETPACK_PRODUCTS_LIST,
	type JETPACK_LEGACY_PLANS,
	type JETPACK_MONTHLY_LEGACY_PLANS,
	type JETPACK_YEARLY_LEGACY_PLANS,
	type JETPACK_RESET_PLANS,
	type TERMS_LIST,
	type PERIOD_LIST,
	type JETPACK_PRODUCT_CATEGORIES,
	type FEATURE_GROUP_ESSENTIAL_FEATURES,
	type FEATURE_GROUP_PERFORMANCE_BOOSTERS,
	type FEATURE_GROUP_HIGH_AVAILABILITY,
	type FEATURE_GROUP_DEVELOPER_TOOLS,
	type FEATURE_GROUP_SECURITY_AND_SAFETY,
	type FEATURE_GROUP_THEMES_AND_CUSTOMIZATION,
	type FEATURE_GROUP_MARKETING_GROWTH_AND_MONETIZATION_TOOLS,
	type FEATURE_GROUP_SUPERIOR_COMMERCE_SOLUTIONS,
	type FEATURE_GROUP_YOUR_STORE,
	type FEATURE_GROUP_PRODUCTS,
	type FEATURE_GROUP_PAYMENTS,
	type FEATURE_GROUP_MARKETING_EMAIL,
	type FEATURE_GROUP_SHIPPING,
	type WOOCOMMERCE_PRODUCTS,
	type TYPES_LIST,
	type WPCOM_SPACE_UPGRADE_PRODUCTS,
	type WPCOM_OTHER_PRODUCTS,
	type JETPACK_ALIAS_LIST,
	FEATURE_GROUP_WEBSITE_BUILDING,
	FEATURE_GROUP_MANAGED_WP_HOSTING,
	FEATURE_GROUP_ECOMMERCE,
	FEATURE_GROUP_SUPPORT,
	FEATURE_GROUP_STORAGE,
	FEATURE_GROUP_ALL_FEATURES,
	FEATURE_1GB_STORAGE,
	FEATURE_3GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_13GB_STORAGE,
	FEATURE_50GB_STORAGE,
	FEATURE_200GB_STORAGE,
	FEATURE_P2_13GB_STORAGE,
	FEATURE_P2_3GB_STORAGE,
	FEATURE_GROUP_DOMAIN,
	FEATURE_GROUP_THEMES,
	FEATURE_GROUP_PERFORMANCE,
	FEATURE_GROUP_ENTITIES,
	FEATURE_GROUP_ADS,
	FEATURE_GROUP_ANALYTICS,
	FEATURE_GROUP_WOO,
	FEATURE_GROUP_CUSTOMIZE_STYLE,
	FEATURE_GROUP_CUSTOM_PLUGINS,
	FEATURE_GROUP_DEV_TOOLS,
	FEATURE_GROUP_BIG_SKY,
	FEATURE_GROUP_UPLOAD_VIDEOS,
	FEATURE_GROUP_STATS,
} from './constants';
import { PriceTierEntry } from './get-price-tier-for-units';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement, MemoExoticComponent } from 'react';

export type Feature = string;

export type FeatureObject = {
	getSlug: () => string;
	getTitle: ( params?: { domainName?: string } ) => TranslateResult;
	getAlternativeTitle?: () => TranslateResult;
	getHeader?: () => TranslateResult;
	getDescription?: ( params?: { domainName?: string } ) => TranslateResult;
	getStoreSlug?: () => string;
	getCompareTitle?: () => TranslateResult;
	getCompareSubtitle?: () => TranslateResult;
	getIcon?: () => string | { icon: string; component: MemoExoticComponent< any > } | JSX.Element;
	isPlan?: boolean;
	getFeatureGroup?: () => string;
	getQuantity?: () => number; // storage add-ons are a quantity based product. this determines checkout price
	getUnitProductSlug?: () => string; // used for storage add-ons to determine the checkout item
	getSubFeatureObjects?: () => Array< FeatureObject >;
};

export type FeatureList = {
	[ key: string ]: FeatureObject;
};

/**
 * WPCOM
 */
const WPCOM_PLAN_STORAGE_FEATURES = < const >[
	FEATURE_1GB_STORAGE,
	FEATURE_3GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_13GB_STORAGE,
	FEATURE_50GB_STORAGE,
	FEATURE_200GB_STORAGE,
	FEATURE_P2_13GB_STORAGE,
	FEATURE_P2_3GB_STORAGE,
];

export type WPComProductSlug = ( typeof WPCOM_PRODUCTS )[ number ];
export type WPComPlanSlug = ( typeof WPCOM_PLANS )[ number ];
export type WPComPlanStorageFeatureSlug = ( typeof WPCOM_PLAN_STORAGE_FEATURES )[ number ];
export type WPComPurchasableItemSlug = WPComProductSlug | WPComPlanSlug;

// WPCOM Space Upgrade Products
// - Special products that do not yet map to the exported `PRODUCTS_LIST` in @automattic/calypso-products
export type WPComSpaceUpgradeProductSlug = ( typeof WPCOM_SPACE_UPGRADE_PRODUCTS )[ number ];

// WPCOM Other Products
// - Special products that do not yet map to the exported `PRODUCTS_LIST` in @automattic/calypso-products
export type WPComOtherProductSlug = ( typeof WPCOM_OTHER_PRODUCTS )[ number ];

export interface WPComPlan extends Plan {
	getAudience?: () => TranslateResult;
	getBlogAudience?: () => TranslateResult;
	getPortfolioAudience?: () => TranslateResult;
	getStoreAudience?: () => TranslateResult;
	getPlanTagline?: () => TranslateResult;
	getNewsletterTagLine?: () => TranslateResult;
	getLinkInBioTagLine?: () => TranslateResult;
	getBlogOnboardingTagLine?: () => TranslateResult;
	getSubTitle?: () => TranslateResult;
	getPlanCompareFeatures?: (
		experiment?: string,
		options?: Record< string, string | boolean[] >
	) => Feature[];
	getSignupFeatures?: () => Feature[];
	getBlogSignupFeatures?: () => Feature[];
	getPortfolioSignupFeatures?: () => Feature[];
	getNewsletterSignupFeatures?: () => Feature[];
	getNewsletterHighlightedFeatures?: () => Feature[];
	getLinkInBioSignupFeatures?: () => Feature[];
	getLinkInBioHighlightedFeatures?: () => Feature[];
	getBlogOnboardingSignupFeatures?: () => Feature[];
	getBlogOnboardingHighlightedFeatures?: () => Feature[];
	getBlogOnboardingSignupJetpackFeatures?: () => Feature[];
	getSenseiFeatures?: ( term?: Product[ 'term' ] ) => () => Feature[];
	getSenseiHighlightedFeatures?: () => Feature[];
	getPromotedFeatures?: () => Feature[];
	getPathSlug: () => string;
	getAnnualPlansOnlyFeatures?: () => string[];
	get2023PricingGridSignupWpcomFeatures?: () => Feature[];
	getHostingSignupFeatures?: ( term?: Product[ 'term' ] ) => () => Feature[];
	getHostingHighlightedFeatures?: () => Feature[];
	getCancellationFeatures?: () => Feature[];
}

export type IncompleteWPcomPlan = Partial< WPComPlan > &
	Pick<
		WPComPlan,
		'group' | 'type' | 'getTitle' | 'getDescription' | 'getPlanCancellationDescription'
	>;

/**
 * Jetpack
 */
export type JetpackProductSlug = ( typeof JETPACK_PRODUCTS_LIST )[ number ];
export type JetpackAliasSlug = ( typeof JETPACK_ALIAS_LIST )[ number ];
export type JetpackLegacyPlanSlug = ( typeof JETPACK_LEGACY_PLANS )[ number ];
export type JetpackYearlyLegacyPlanSlug = ( typeof JETPACK_YEARLY_LEGACY_PLANS )[ number ];
export type JetpackMonthlyLegacyPlanSlug = ( typeof JETPACK_MONTHLY_LEGACY_PLANS )[ number ];
export type JetpackResetPlanSlug = ( typeof JETPACK_RESET_PLANS )[ number ];
export type JetpackPlanSlug =
	| typeof PLAN_JETPACK_FREE
	| JetpackLegacyPlanSlug
	| JetpackResetPlanSlug;
export type JetpackPurchasableItemSlug =
	| JetpackProductSlug
	| Exclude< JetpackPlanSlug, typeof PLAN_JETPACK_FREE >;

/**
 * WooCommerce
 */
export type WooCommerceProductSlug = ( typeof WOOCOMMERCE_PRODUCTS )[ number ];

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

export interface FAQ {
	id: string;
	question: TranslateResult;
	answer: TranslateResult;
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

export type JetpackProductCategory = ( typeof JETPACK_PRODUCT_CATEGORIES )[ number ];

// All
export type ProductSlug = WPComProductSlug | JetpackProductSlug | WooCommerceProductSlug;
export type PlanSlug = WPComPlanSlug | JetpackPlanSlug;
export type PlanType = ( typeof TYPES_LIST )[ number ];
export type PurchasableItemSlug = WPComPurchasableItemSlug | JetpackPurchasableItemSlug;

export interface Product {
	product_name: TranslateResult;
	product_slug: ProductSlug;
	product_alias?: JetpackAliasSlug;
	type: ProductSlug;
	term: ( typeof TERMS_LIST )[ number ];
	bill_period: ( typeof PERIOD_LIST )[ number ];
	price_tier_list?: Array< PriceTierEntry >;
	categories: JetpackProductCategory[];
	getFeatures?: () => Feature[];
	getProductId: () => number;
	getStoreSlug: () => ProductSlug;
}

export interface BillingTerm {
	term: ( typeof TERMS_LIST )[ number ];
	getBillingTimeFrame: () => TranslateResult;
}

export type FeatureGroupSlug =
	| typeof FEATURE_GROUP_ESSENTIAL_FEATURES
	| typeof FEATURE_GROUP_PERFORMANCE_BOOSTERS
	| typeof FEATURE_GROUP_HIGH_AVAILABILITY
	| typeof FEATURE_GROUP_DEVELOPER_TOOLS
	| typeof FEATURE_GROUP_SECURITY_AND_SAFETY
	| typeof FEATURE_GROUP_THEMES_AND_CUSTOMIZATION
	| typeof FEATURE_GROUP_SUPERIOR_COMMERCE_SOLUTIONS
	| typeof FEATURE_GROUP_MARKETING_GROWTH_AND_MONETIZATION_TOOLS
	| typeof FEATURE_GROUP_YOUR_STORE
	| typeof FEATURE_GROUP_WEBSITE_BUILDING
	| typeof FEATURE_GROUP_MANAGED_WP_HOSTING
	| typeof FEATURE_GROUP_ECOMMERCE
	| typeof FEATURE_GROUP_SUPPORT
	| typeof FEATURE_GROUP_PRODUCTS
	| typeof FEATURE_GROUP_PAYMENTS
	| typeof FEATURE_GROUP_MARKETING_EMAIL
	| typeof FEATURE_GROUP_SHIPPING
	| typeof FEATURE_GROUP_STORAGE
	| typeof FEATURE_GROUP_ALL_FEATURES
	| typeof FEATURE_GROUP_ADS
	| typeof FEATURE_GROUP_ANALYTICS
	| typeof FEATURE_GROUP_CUSTOMIZE_STYLE
	| typeof FEATURE_GROUP_DOMAIN
	| typeof FEATURE_GROUP_ENTITIES
	| typeof FEATURE_GROUP_BIG_SKY
	| typeof FEATURE_GROUP_UPLOAD_VIDEOS
	| typeof FEATURE_GROUP_STATS
	| typeof FEATURE_GROUP_PERFORMANCE
	| typeof FEATURE_GROUP_THEMES
	| typeof FEATURE_GROUP_WOO
	| typeof FEATURE_GROUP_CUSTOM_PLUGINS
	| typeof FEATURE_GROUP_DEV_TOOLS;

export interface FeatureFootnotes {
	[ key: string ]: Feature[];
}

export type FeatureGroup = {
	slug: FeatureGroupSlug;
	getTitle: () => string | null;
	getFeatures: () => Feature[];
	/**
	 * This optionally returns an object containing footnotes and the features that should display the footnote.
	 *
	 * For example:
	 * getFootnotes: () => ( {
	 * 	'This is the text displayed at the bottom of the comparison grid': [ 'feature-1', 'feature-2' ],
	 * }).
	 *
	 * Footnotes will be automatically numbered in the order the feature groups are listed. For example, in the wooExpressFeatureGroups, FEATURE_GROUP_PAYMENTS and FEATURE_GROUP_SHIPPING each have a single footnote which will be numbered 1 and 2 respectively.
	 */
	getFootnotes?: () => FeatureFootnotes;
};
export type FeatureGroupMap = Record< FeatureGroupSlug, FeatureGroup >;

export type Plan = BillingTerm & {
	group: typeof GROUP_WPCOM | typeof GROUP_JETPACK | typeof GROUP_P2;
	type: PlanType;
	availableFor?: ( plan: PlanSlug ) => boolean;
	getSignupCompareAvailableFeatures?: () => string[];

	/**
	 * Features to be shown in the plan details table and the plans comparison table.
	 * If get2023PricingGridSignupWpcomFeature exists,
	 * this feature list will be ignored in the plans comparison table only.
	 * Context - pdgrnI-26j
	 */
	get2023PricingGridSignupWpcomFeatures?: () => Feature[];

	/**
	 * This function returns the features that are to be overridden and shown in the plans comparison table.
	 * Context - pdgrnI-26j
	 */
	get2023PlanComparisonFeatureOverride?: () => Feature[];

	/**
	 * Features to be shown in the plan details jetpack section and the jetpack features in the plans comparison table.
	 * If get2023PlanComparisonJetpackFeatureOverride exists,
	 * this feature list will be ignored in the plans comparison table only.
	 * Context - pdgrnI-26j
	 */
	get2023PricingGridSignupJetpackFeatures?: () => Feature[];

	/**
	 * This function returns the Jetpack features that are to be overridden and shown in the plans comparison table.
	 * Context - pdgrnI-26j
	 */
	get2023PlanComparisonJetpackFeatureOverride?: () => Feature[];

	/**
	 * Features that are conditionally available and are to be shown in the plans comparison table.
	 * For example: "Available with plugins"
	 */
	getPlanComparisonFeatureLabels?: () => Record< Feature, TranslateResult >;

	getStorageFeature?: (
		showLegacyStorageFeature?: boolean,
		isCurrentPlan?: boolean
	) => WPComPlanStorageFeatureSlug;
	getProductId: () => number;
	getPathSlug?: () => string;
	getStoreSlug: () => PlanSlug;
	getTitle: () => TranslateResult;
	getDescription: () => TranslateResult;
	getShortDescription?: () => TranslateResult;
	getFeaturedDescription?: () => TranslateResult;
	getLightboxDescription?: () => TranslateResult;
	getPlanCancellationDescription?: () => TranslateResult;
	getProductsIncluded?: () => ReadonlyArray< string >;
	getWhatIsIncluded?: () => Array< TranslateResult >;
	getBenefits?: () => Array< TranslateResult >;
	getRecommendedFor?: () => Array< JetpackTag >;
	getTagline?: () => TranslateResult;
	getPlanCardFeatures?: () => Feature[];
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
	getNewsletterSignupFeatures?: () => Feature[];
	getLinkInBioSignupFeatures?: () => Feature[];
	getBlogOnboardingSignupFeatures?: () => Feature[];
	getBlogOnboardingHighlightedFeatures?: () => Feature[];
	getBlogOnboardingSignupJetpackFeatures?: () => Feature[];

	/**
	 * Features that are shown on the right sidebar of the checkout page.
	 */
	getCheckoutFeatures?: () => Feature[];
};

export type WithSnakeCaseSlug = { product_slug: string };
export type WithCamelCaseSlug = { productSlug: string };

export type WithSlugAndAmount = ( WithCamelCaseSlug | WithSnakeCaseSlug ) & {
	amount: number;
};

export interface PlanMatchesQuery {
	term?: string;
	group?: string;
	type?: string;
}
