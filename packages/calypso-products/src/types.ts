import { PriceTierEntry } from './get-price-tier-for-units';
import type {
	GROUP_JETPACK,
	GROUP_WPCOM,
	GROUP_P2,
	WPCOM_PRODUCTS,
	WPCOM_PLANS,
	WPCOM_STORAGE_ADD_ONS,
	PLAN_JETPACK_FREE,
	JETPACK_PRODUCTS_LIST,
	JETPACK_LEGACY_PLANS,
	JETPACK_RESET_PLANS,
	TERMS_LIST,
	PERIOD_LIST,
	JETPACK_PRODUCT_CATEGORIES,
	FEATURE_GROUP_ESSENTIAL_FEATURES,
	FEATURE_GROUP_PERFORMANCE_BOOSTERS,
	FEATURE_GROUP_HIGH_AVAILABILITY,
	FEATURE_GROUP_DEVELOPER_TOOLS,
	FEATURE_GROUP_SECURITY_AND_SAFETY,
	FEATURE_GROUP_THEMES_AND_CUSTOMIZATION,
	FEATURE_GROUP_MARKETING_GROWTH_AND_MONETIZATION_TOOLS,
	FEATURE_GROUP_SUPERIOR_COMMERCE_SOLUTIONS,
	FEATURE_GROUP_YOUR_STORE,
	FEATURE_GROUP_PRODUCTS,
	FEATURE_GROUP_PAYMENTS,
	FEATURE_GROUP_MARKETING_EMAIL,
	FEATURE_GROUP_SHIPPING,
	WOOCOMMERCE_PRODUCTS,
} from './constants';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement, MemoExoticComponent } from 'react';

export type Feature = string;

export type FeatureObject = {
	getSlug: () => string;
	getTitle: ( domainName?: string ) => TranslateResult;
	getAlternativeTitle?: () => TranslateResult;
	getConditionalTitle?: ( planSlug?: string ) => TranslateResult;
	getHeader?: () => TranslateResult;
	getDescription?: ( domainName?: string ) => TranslateResult;
	getStoreSlug?: () => string;
	getCompareTitle?: () => TranslateResult;
	getCompareSubtitle?: () => TranslateResult;
	getIcon?: () => string | { icon: string; component: MemoExoticComponent< any > } | JSX.Element;
	isPlan?: boolean;
	getFeatureGroup?: () => string;
	getQuantity?: () => number; // storage add-ons are a quantity based product. this determines checkout price
	getUnitProductSlug?: () => string; // used for storage add-ons to determine the checkout item
};

export type FeatureList = {
	[ key: string ]: FeatureObject;
};

// WPCom
export type WPComProductSlug = ( typeof WPCOM_PRODUCTS )[ number ];
export type WPComPlanSlug = ( typeof WPCOM_PLANS )[ number ];
export type WPComPurchasableItemSlug = WPComProductSlug | WPComPlanSlug;
export type WPComStorageAddOnSlug = ( typeof WPCOM_STORAGE_ADD_ONS )[ number ];

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
	getNewsletterDescription?: () => string;
	getNewsletterSignupFeatures?: () => Feature[];
	getNewsletterHighlightedFeatures?: () => Feature[];
	getLinkInBioDescription?: () => string;
	getLinkInBioSignupFeatures?: () => Feature[];
	getLinkInBioHighlightedFeatures?: () => Feature[];
	getBlogOnboardingSignupFeatures?: () => Feature[];
	getBlogOnboardingHighlightedFeatures?: () => Feature[];
	getBlogOnboardingSignupJetpackFeatures?: () => Feature[];
	getPromotedFeatures?: () => Feature[];
	getPathSlug: () => string;
	getAnnualPlansOnlyFeatures?: () => string[];
	get2023PricingGridSignupWpcomFeatures?: () => Feature[];
	getHostingSignupFeatures?: ( term?: Product[ 'term' ] ) => () => Feature[];
	getHostingHighlightedFeatures?: () => Feature[];
}

export type IncompleteWPcomPlan = Partial< WPComPlan > &
	Pick<
		WPComPlan,
		'group' | 'type' | 'getTitle' | 'getDescription' | 'getPlanCancellationDescription'
	>;

// Jetpack
export type JetpackProductSlug = ( typeof JETPACK_PRODUCTS_LIST )[ number ];
export type JetpackLegacyPlanSlug = ( typeof JETPACK_LEGACY_PLANS )[ number ];
export type JetpackResetPlanSlug = ( typeof JETPACK_RESET_PLANS )[ number ];
export type JetpackPlanSlug =
	| typeof PLAN_JETPACK_FREE
	| JetpackLegacyPlanSlug
	| JetpackResetPlanSlug;
export type JetpackPurchasableItemSlug =
	| JetpackProductSlug
	| Exclude< JetpackPlanSlug, typeof PLAN_JETPACK_FREE >;

// WooCommerce
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
export type PurchasableItemSlug = WPComPurchasableItemSlug | JetpackPurchasableItemSlug;

export interface Product {
	product_name: TranslateResult;
	product_slug: ProductSlug;
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
	| typeof FEATURE_GROUP_PRODUCTS
	| typeof FEATURE_GROUP_PAYMENTS
	| typeof FEATURE_GROUP_MARKETING_EMAIL
	| typeof FEATURE_GROUP_SHIPPING;

export interface FeatureFootnotes {
	[ key: string ]: Feature[];
}

export type FeatureGroup = {
	slug: FeatureGroupSlug;
	getTitle: () => string;
	get2023PricingGridSignupWpcomFeatures: () => Feature[];
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

export type StorageOption = {
	slug: string;
	// Determines if the storage option is an add-on that can be purchased. There are a mixture of patterns
	// to identify add-ons for now, and we're temporarily adding one more
	isAddOn: boolean;
};

export type Plan = BillingTerm & {
	group: typeof GROUP_WPCOM | typeof GROUP_JETPACK | typeof GROUP_P2;
	type: string;
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
	get2023PlanComparisonConditionalFeatures?: () => Feature[];

	get2023PricingGridSignupStorageOptions?: (
		showLegacyStorageFeature?: boolean,
		isCurrentPlan?: boolean
	) => StorageOption[];
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

export interface CancellationFeatureLists {
	monthly: CancellationFeatureList;
	yearly: CancellationFeatureList;
	withDomain: CancellationFeatureList;
}

export interface CancellationFeatureList {
	featureList: string[];
	andMore: boolean;
}
