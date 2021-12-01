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
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_CRM_MONTHLY,
	PRODUCT_JETPACK_CRM_FREE,
	PRODUCT_JETPACK_CRM_FREE_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	TERM_ANNUALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import buildCardFeaturesFromItem from './build-card-features-from-item';
import { getForCurrentCROIteration, Iterations } from './iterations';
import type { SelectorProduct } from './types';
import type { JetpackPlanSlug } from '@automattic/calypso-products';

export const PLAN_COMPARISON_PAGE = 'https://jetpack.com/features/comparison/';
export const INTRO_PRICING_DISCOUNT_PERCENTAGE = 50;

// Types of items. This determines the card UI.
export const ITEM_TYPE_PLAN = 'item-type-plan';
export const ITEM_TYPE_PRODUCT = 'item-type-product';

// Jetpack CRM

const CRM_ENTREPRENEUR_PRICE = 17;
const CRM_ENTREPRENEUR_CURRENCY = 'USD';

export const EXTERNAL_PRODUCT_CRM_FREE: ( variation: Iterations ) => SelectorProduct = (
	variation
) => ( {
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
		items: buildCardFeaturesFromItem(
			[
				FEATURE_CRM_NO_CONTACT_LIMITS,
				FEATURE_CRM_PROPOSALS_AND_INVOICES,
				FEATURE_CRM_INTEGRATED_WITH_WORDPRESS,
			],
			{ withoutDescription: true, withoutIcon: true },
			variation
		),
	},
	hidePrice: true,
	externalUrl:
		'https://jetpackcrm.com/pricing?utm_source=jetpack&utm_medium=web&utm_campaign=pricing_i4&utm_content=pricing',
} );

export const EXTERNAL_PRODUCT_CRM_FREE_MONTHLY: ( variation: Iterations ) => SelectorProduct = (
	variation
) => ( {
	...EXTERNAL_PRODUCT_CRM_FREE( variation ),
	term: TERM_MONTHLY,
	productSlug: PRODUCT_JETPACK_CRM_FREE_MONTHLY,
	costProductSlug: PRODUCT_JETPACK_CRM_FREE_MONTHLY,
	monthlyProductSlug: PRODUCT_JETPACK_CRM_FREE_MONTHLY,
} );

export const EXTERNAL_PRODUCT_CRM: ( variation: Iterations ) => SelectorProduct = (
	variation
) => ( {
	productSlug: PRODUCT_JETPACK_CRM,
	term: TERM_ANNUALLY,
	type: ITEM_TYPE_PRODUCT,
	costProductSlug: PRODUCT_JETPACK_CRM,
	monthlyProductSlug: PRODUCT_JETPACK_CRM,
	iconSlug: 'jetpack_crm',
	displayName: translate( 'CRM Entrepreneur' ),
	shortName: translate( 'CRM Entrepreneur' ),
	tagline: translate( 'Manage contacts effortlessly' ),
	// Jetpack CRM isn't considered as a product like others for the time being (and therefore not
	// available via the API). Rather like a third-party product.
	// See pricing in https://jetpackcrm.com/pricing/ (only available in USD)
	displayPrice: CRM_ENTREPRENEUR_PRICE,
	displayCurrency: CRM_ENTREPRENEUR_CURRENCY,
	description: translate(
		'The most simple and powerful WordPress CRM. Improve customer relationships and increase profits.'
	),
	buttonLabel: translate( 'Get CRM' ),
	features: {
		items: buildCardFeaturesFromItem(
			[
				FEATURE_CRM_LEADS_AND_FUNNEL,
				FEATURE_CRM_PROPOSALS_AND_INVOICES,
				FEATURE_CRM_TRACK_TRANSACTIONS,
				FEATURE_CRM_NO_CONTACT_LIMITS,
			],
			{ withoutDescription: true, withoutIcon: true },
			variation
		),
	},
	hidePrice: true,
	externalUrl: 'https://jetpackcrm.com/pricing/',
} );

export const EXTERNAL_PRODUCT_CRM_MONTHLY: ( variation: Iterations ) => SelectorProduct = (
	variation
) => ( {
	...EXTERNAL_PRODUCT_CRM( variation ),
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
export const EXTERNAL_PRODUCTS_SLUG_MAP: Record<
	string,
	( variation: Iterations ) => SelectorProduct
> = {
	[ PRODUCT_JETPACK_CRM_FREE ]: EXTERNAL_PRODUCT_CRM_FREE,
	[ PRODUCT_JETPACK_CRM_FREE_MONTHLY ]: EXTERNAL_PRODUCT_CRM_FREE_MONTHLY,
	[ PRODUCT_JETPACK_CRM ]: EXTERNAL_PRODUCT_CRM,
	[ PRODUCT_JETPACK_CRM_MONTHLY ]: EXTERNAL_PRODUCT_CRM_MONTHLY,
};

/**
 * Constants that contain products including option and regular types.
 */

export const SELECTOR_PLANS = getForCurrentCROIteration( {
	[ Iterations.ONLY_REALTIME_PRODUCTS ]: [
		PLAN_JETPACK_SECURITY_T1_YEARLY,
		PLAN_JETPACK_SECURITY_T1_MONTHLY,
		PLAN_JETPACK_COMPLETE,
		PLAN_JETPACK_COMPLETE_MONTHLY,
	],
} ) ?? [
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
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

export const isTier1 = ( slug: string ): boolean => TIER_1_SLUGS.includes( slug );
export const isTier2 = ( slug: string ): boolean => TIER_2_SLUGS.includes( slug );
