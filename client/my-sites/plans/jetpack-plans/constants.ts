import {
	FEATURE_ACTIVITY_LOG,
	FEATURE_ADVANCED_SEO,
	FEATURE_CRM_INTEGRATED_WITH_WORDPRESS,
	FEATURE_CRM_LEADS_AND_FUNNEL,
	FEATURE_CRM_NO_CONTACT_LIMITS,
	FEATURE_CRM_PROPOSALS_AND_INVOICES,
	FEATURE_CRM_TRACK_TRANSACTIONS,
	FEATURE_GOOGLE_ANALYTICS,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	JETPACK_BACKUP_T1_PRODUCTS,
	JETPACK_BACKUP_T2_PRODUCTS,
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_CRM_MONTHLY,
	PRODUCT_JETPACK_CRM_FREE,
	PRODUCT_JETPACK_CRM_FREE_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_ANTI_SPAM,
	TERM_ANNUALLY,
	TERM_MONTHLY,
	JETPACK_VIDEOPRESS_PRODUCTS,
	JETPACK_SECURITY_T1_PLANS,
	JETPACK_SECURITY_T2_PLANS,
	JETPACK_COMPLETE_PLANS,
	JETPACK_GROWTH_PLANS,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
	PLAN_JETPACK_GROWTH_YEARLY,
	PLAN_JETPACK_GROWTH_MONTHLY,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import buildCardFeaturesFromItem from './build-card-features-from-item';
import type { SelectorProduct } from './types';
import type { JetpackPlanSlug, JetpackPurchasableItemSlug } from '@automattic/calypso-products';

export const INTRO_PRICING_DISCOUNT_PERCENTAGE = 50;
export const GUARANTEE_DAYS = 14;

// Types of items. This determines the card UI.
export const ITEM_TYPE_PLAN = 'item-type-plan';
export const ITEM_TYPE_PRODUCT = 'item-type-product';

// Jetpack CRM

const CRM_ENTREPRENEUR_PRICE = 17;
const CRM_ENTREPRENEUR_CURRENCY = 'USD';

export const EXTERNAL_PRODUCT_CRM_FREE = (): SelectorProduct => ( {
	productSlug: PRODUCT_JETPACK_CRM_FREE,
	term: TERM_ANNUALLY,
	type: ITEM_TYPE_PRODUCT,
	isFree: true,
	costProductSlug: PRODUCT_JETPACK_CRM_FREE,
	monthlyProductSlug: PRODUCT_JETPACK_CRM_FREE_MONTHLY,
	belowPriceText: translate( 'from %(minPrice)s - %(maxPrice)s', {
		args: { minPrice: '$0', maxPrice: '$17' },
	} ),
	iconSlug: 'jetpack_crm',
	displayName: translate( 'Jetpack CRM Free' ),
	shortName: translate( 'CRM' ),
	tagline: translate( 'Manage contacts effortlessly' ),
	// Jetpack CRM isn't considered as a product like others for the time being (and therefore not
	// available via the API). Rather like a third-party product.
	// See pricing in https://jetpackcrm.com/pricing/ (only available in USD)
	description: translate( 'Build better relationships with your customers and clients.' ),
	buttonLabel: translate( 'Start for free' ),
	features: {
		items: buildCardFeaturesFromItem( [
			FEATURE_CRM_NO_CONTACT_LIMITS,
			FEATURE_CRM_PROPOSALS_AND_INVOICES,
			FEATURE_CRM_INTEGRATED_WITH_WORDPRESS,
		] ),
	},
	hidePrice: true,
	externalUrl:
		'https://jetpackcrm.com/pricing?utm_source=jetpack&utm_medium=web&utm_campaign=pricing_i4&utm_content=pricing',
} );

export const EXTERNAL_PRODUCT_CRM_FREE_MONTHLY = (): SelectorProduct => ( {
	...EXTERNAL_PRODUCT_CRM_FREE(),
	term: TERM_MONTHLY,
	productSlug: PRODUCT_JETPACK_CRM_FREE_MONTHLY,
	costProductSlug: PRODUCT_JETPACK_CRM_FREE_MONTHLY,
	monthlyProductSlug: PRODUCT_JETPACK_CRM_FREE_MONTHLY,
} );

export const EXTERNAL_PRODUCT_CRM = (): SelectorProduct => ( {
	productSlug: PRODUCT_JETPACK_CRM,
	term: TERM_ANNUALLY,
	type: ITEM_TYPE_PRODUCT,
	costProductSlug: PRODUCT_JETPACK_CRM,
	monthlyProductSlug: PRODUCT_JETPACK_CRM,
	iconSlug: 'jetpack_crm',
	displayName: translate( 'CRM Entrepreneur' ),
	shortName: translate( 'CRM' ),
	tagline: translate( 'Manage contacts effortlessly' ),
	// Jetpack CRM isn't considered as a product like others for the time being (and therefore not
	// available via the API). Rather like a third-party product.
	// See pricing in https://jetpackcrm.com/pricing/ (only available in USD)
	displayPrice: CRM_ENTREPRENEUR_PRICE,
	displayCurrency: CRM_ENTREPRENEUR_CURRENCY,
	description: translate(
		'The most simple and powerful WordPress CRM. Improve customer relationships and increase profits.'
	),
	shortDescription: translate(
		'Build better relationships with your customers and grow your business.'
	),
	buttonLabel: translate( 'Get CRM' ),
	features: {
		items: buildCardFeaturesFromItem( [
			FEATURE_CRM_LEADS_AND_FUNNEL,
			FEATURE_CRM_PROPOSALS_AND_INVOICES,
			FEATURE_CRM_TRACK_TRANSACTIONS,
			FEATURE_CRM_NO_CONTACT_LIMITS,
		] ),
	},
	hidePrice: true,
	externalUrl: 'https://jetpackcrm.com/pricing/',
} );

export const EXTERNAL_PRODUCT_CRM_MONTHLY = (): SelectorProduct => ( {
	...EXTERNAL_PRODUCT_CRM(),
	productSlug: PRODUCT_JETPACK_CRM_MONTHLY,
	term: TERM_MONTHLY,
	displayTerm: TERM_ANNUALLY,
	costProductSlug: PRODUCT_JETPACK_CRM_MONTHLY,
} );

// List of products showcased in the Plans grid but not sold through Calypso
export const EXTERNAL_PRODUCTS_LIST = [
	PRODUCT_JETPACK_CRM_FREE,
	PRODUCT_JETPACK_CRM_FREE_MONTHLY,
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_CRM_MONTHLY,
];

// External Product slugs to SelectorProduct.
export const EXTERNAL_PRODUCTS_SLUG_MAP: Record< string, () => SelectorProduct > = {
	[ PRODUCT_JETPACK_CRM_FREE ]: EXTERNAL_PRODUCT_CRM_FREE,
	[ PRODUCT_JETPACK_CRM_FREE_MONTHLY ]: EXTERNAL_PRODUCT_CRM_FREE_MONTHLY,
	[ PRODUCT_JETPACK_CRM ]: EXTERNAL_PRODUCT_CRM,
	[ PRODUCT_JETPACK_CRM_MONTHLY ]: EXTERNAL_PRODUCT_CRM_MONTHLY,
};

// Jetpack Stats

export const INDIRECT_CHECKOUT_PRODUCT_STATS_PWYW_YEARLY = (): SelectorProduct => ( {
	type: ITEM_TYPE_PRODUCT,
	iconSlug: 'jetpack_stats',
	tagline: translate( 'Simple, yet powerful analytics' ),
	description: translate(
		'With Jetpack Stats, you don’t need to be a data scientist to see how your site is performing.'
	),
	shortDescription: translate( 'Simple, yet powerful stats to grow your site.' ),
	buttonLabel: translate( 'Get Stats' ),
	features: {
		items: [],
	},
	hidePrice: true,

	// The Stats PWYW product in the Plans grid is shown as `Stats` but also referred to `Stats (Personal)`,
	// which aligns with the naming in packages/calypso-products/src/translations.tsx.
	displayName: translate( 'Stats (Personal)' ),
	shortName: translate( 'Stats (Personal)' ),
	productSlug: PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	costProductSlug: PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	term: TERM_ANNUALLY,

	// Set the price directly with the translated string.
	displayPriceText: translate( 'Varies', {
		comment:
			'Used to describe price of Jetpack Stats, which can be either a pay-what-you-want product or fixed price product. In the future, it can also be a metered product.',
	} ),

	moreAboutUrl: 'https://jetpack.com/redirect/?source=jetpack-stats-learn-more-about-new-pricing',
	indirectCheckoutUrl: '/stats/purchase/{siteSlug}?from=calypso-plans',
} );

export const INDIRECT_CHECKOUT_PRODUCT_STATS_FREE = (): SelectorProduct => ( {
	...INDIRECT_CHECKOUT_PRODUCT_STATS_PWYW_YEARLY(),
	displayName: translate( 'Stats (Free)' ),
	shortName: translate( 'Stats (Free)' ),
	productSlug: PRODUCT_JETPACK_STATS_FREE,
	costProductSlug: PRODUCT_JETPACK_STATS_FREE,
	isFree: true,
} );

// List of products showcased in the Plans grid but not sold via checkout URL directly.
export const INDIRECT_CHECKOUT_PRODUCTS_LIST = [
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
];

// Indirect checkout Product slugs to SelectorProduct.
export const INDIRECT_CHECKOUT_PRODUCTS_SLUG_MAP: Record< string, () => SelectorProduct > = {
	[ PRODUCT_JETPACK_STATS_PWYW_YEARLY ]: INDIRECT_CHECKOUT_PRODUCT_STATS_PWYW_YEARLY,
	[ PRODUCT_JETPACK_STATS_FREE ]: INDIRECT_CHECKOUT_PRODUCT_STATS_FREE,
};

/**
 * Constants that contain products including option and regular types.
 */

export const SELECTOR_PLANS = [
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_GROWTH_YEARLY,
	PLAN_JETPACK_GROWTH_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
];

/*
 * Matrix of allowed upsells between products (not plans or bundles).
 */
export const UPSELL_PRODUCT_MATRIX: Record< string, string > = {
	[ PRODUCT_JETPACK_SCAN ]: PRODUCT_JETPACK_BACKUP_DAILY,
	[ PRODUCT_JETPACK_SCAN_MONTHLY ]: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: PRODUCT_JETPACK_SCAN,
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: PRODUCT_JETPACK_SCAN_MONTHLY,
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: PRODUCT_JETPACK_SCAN,
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: PRODUCT_JETPACK_SCAN_MONTHLY,
};

/**
 * Matrix of products upsold by specific features.
 */
export const PRODUCT_UPSELLS_BY_FEATURE: Record< string, JetpackPlanSlug > = {
	[ FEATURE_GOOGLE_ANALYTICS ]: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	[ FEATURE_VIDEO_UPLOADS_JETPACK_PRO ]: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	[ FEATURE_ADVANCED_SEO ]: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	[ FEATURE_ACTIVITY_LOG ]: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
};

/**
 * Matrix of products upsold in the purchase flow, in between the pricing and checkout pages.
 */
export const PURCHASE_FLOW_UPSELLS_MATRIX: Record< string, JetpackPurchasableItemSlug > = {
	[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: PLAN_JETPACK_SECURITY_T1_YEARLY,
	[ PRODUCT_JETPACK_SCAN ]: PLAN_JETPACK_SECURITY_T1_YEARLY,
	[ PRODUCT_JETPACK_ANTI_SPAM ]: PLAN_JETPACK_SECURITY_T1_YEARLY,
};

/**
 * Matrix of available dowgradable plans for each plan.
 */
export const DOWNGRADEABLE_PLANS_FROM_PLAN: Record< string, string[] > = {
	[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ]: [],
	[ PLAN_JETPACK_SECURITY_DAILY ]: [ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ],
	[ PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ]: [
		PLAN_JETPACK_SECURITY_DAILY,
		PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	],
	[ PLAN_JETPACK_SECURITY_REALTIME ]: [
		PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
		PLAN_JETPACK_SECURITY_DAILY,
		PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	],
	[ PLAN_JETPACK_COMPLETE ]: [
		PLAN_JETPACK_COMPLETE_MONTHLY,
		PLAN_JETPACK_SECURITY_REALTIME,
		PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
		PLAN_JETPACK_SECURITY_DAILY,
		PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	],
	[ PLAN_JETPACK_COMPLETE_MONTHLY ]: [
		PLAN_JETPACK_SECURITY_REALTIME,
		PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
		PLAN_JETPACK_SECURITY_DAILY,
		PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	],
};

export const TIER_1_SLUGS = [
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
];

export const TIER_2_SLUGS = [
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
];

export const MOST_POPULAR_PRODUCTS = [
	...JETPACK_BACKUP_T1_PRODUCTS,
	...JETPACK_BACKUP_T2_PRODUCTS,
	...JETPACK_VIDEOPRESS_PRODUCTS,
];

export const MOST_POPULAR_BUNDLES = [
	...JETPACK_SECURITY_T1_PLANS,
	...JETPACK_SECURITY_T2_PLANS,
	...JETPACK_COMPLETE_PLANS,
	...JETPACK_GROWTH_PLANS,
];

export const isTier1 = ( slug: string ): boolean => TIER_1_SLUGS.includes( slug );
export const isTier2 = ( slug: string ): boolean => TIER_2_SLUGS.includes( slug );
