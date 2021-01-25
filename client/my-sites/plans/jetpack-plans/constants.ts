/**
 * External dependencies
 */
import { createElement } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_CRM_MONTHLY,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
} from 'calypso/lib/products-values/constants';
import {
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	TERM_ANNUALLY,
	TERM_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	FEATURE_CATEGORY_SECURITY,
	FEATURE_BACKUP_V2,
	FEATURE_PRODUCT_BACKUP_V2,
	FEATURE_PRODUCT_SCAN_V2,
	FEATURE_PRODUCT_ANTISPAM_V2,
	FEATURE_ACTIVITY_LOG_V2,
	FEATURE_CATEGORY_OTHER,
	FEATURE_VIDEO_HOSTING_V2,
	FEATURE_SOCIAL_MEDIA_POSTING_V2,
	FEATURE_COLLECT_PAYMENTS_V2,
	FEATURE_SITE_MONETIZATION_V2,
	FEATURE_PRIORITY_SUPPORT_V2,
	FEATURE_ONE_CLICK_RESTORE_V2,
	FEATURE_SECURE_STORAGE_V2,
	FEATURE_CRM_LEADS_AND_FUNNEL,
	FEATURE_CRM_PROPOSALS_AND_INVOICES,
	FEATURE_CRM_TRACK_TRANSACTIONS,
	FEATURE_CRM_NO_CONTACT_LIMITS,
	FEATURE_CRM_PRIORITY_SUPPORT,
	FEATURE_PRODUCT_BACKUP_DAILY_V2,
	FEATURE_PRODUCT_BACKUP_REALTIME_V2,
	FEATURE_SEARCH_V2,
	FEATURE_PRODUCT_SEARCH_V2,
	FEATURE_CRM_V2,
	FEATURE_GOOGLE_ANALYTICS,
	FEATURE_ADVANCED_SEO,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
	FEATURE_ACTIVITY_LOG,
} from 'calypso/lib/plans/constants';
import { buildCardFeaturesFromItem } from './utils';

/**
 * Type dependencies
 */
import type { SelectorProduct, SelectorProductSlug } from './types';
import type { JetpackPlanSlugs } from 'calypso/lib/plans/types';

export const ALL = 'all';
export const PERFORMANCE = 'performance';
export const SECURITY = 'security';
export const PLAN_COMPARISON_PAGE = 'https://jetpack.com/features/comparison/';

/**
 * Link to plan comparison page.
 */
export const MORE_FEATURES_LINK = {
	url: PLAN_COMPARISON_PAGE,
	label: translate( 'See all features' ),
};

/**
 * Define properties with translatable strings getters.
 */
Object.defineProperties( MORE_FEATURES_LINK, {
	label: {
		get: () => translate( 'See all features' ),
	},
} );

/**
 * Plans and products that have options and can't be purchased themselves.
 */
export const OPTIONS_JETPACK_SECURITY = 'jetpack_security';
export const OPTIONS_JETPACK_SECURITY_MONTHLY = 'jetpack_security_monthly';
export const OPTIONS_JETPACK_BACKUP = 'jetpack_backup';
export const OPTIONS_JETPACK_BACKUP_MONTHLY = 'jetpack_backup_monthly';

// Types of items. This determines the card UI.
export const ITEM_TYPE_PLAN = 'item-type-plan';
export const ITEM_TYPE_BUNDLE = 'item-type-bundle';
export const ITEM_TYPE_PRODUCT = 'item-type-product';

export const PRODUCTS_WITH_OPTIONS = [
	OPTIONS_JETPACK_SECURITY,
	OPTIONS_JETPACK_SECURITY_MONTHLY,
	OPTIONS_JETPACK_BACKUP,
	OPTIONS_JETPACK_BACKUP_MONTHLY,
] as const;

// Jetpack Security
export const OPTION_PLAN_SECURITY: ( variation: string ) => SelectorProduct = ( variation ) => {
	const plan = {
		productSlug: OPTIONS_JETPACK_SECURITY,
		annualOptionSlug: OPTIONS_JETPACK_SECURITY,
		monthlyOptionSlug: OPTIONS_JETPACK_SECURITY_MONTHLY,
		term: TERM_ANNUALLY,
		type: ITEM_TYPE_BUNDLE,
		subtypes: [ PLAN_JETPACK_SECURITY_DAILY, PLAN_JETPACK_SECURITY_REALTIME ],
		costProductSlug: PLAN_JETPACK_SECURITY_DAILY,
		monthlyProductSlug: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
		iconSlug: 'jetpack_security_v2',
		displayName: translate( 'Jetpack Security' ),
		shortName: translate( 'Security', {
			comment: 'Short name of the Jetpack Security generic plan',
		} ),
		tagline: translate( 'Comprehensive WordPress protection' ),
		description: translate(
			'Enjoy the peace of mind of complete site security. ' +
				'Easy-to-use, powerful security tools guard your site, so you can focus on your business.'
		),
		features: {
			items: buildCardFeaturesFromItem(
				{
					[ FEATURE_CATEGORY_SECURITY ]: [
						FEATURE_PRODUCT_BACKUP_V2,
						FEATURE_PRODUCT_SCAN_V2,
						FEATURE_PRODUCT_ANTISPAM_V2,
						FEATURE_ACTIVITY_LOG_V2,
					],
					[ FEATURE_CATEGORY_OTHER ]: [
						FEATURE_VIDEO_HOSTING_V2,
						FEATURE_SOCIAL_MEDIA_POSTING_V2,
						FEATURE_COLLECT_PAYMENTS_V2,
						FEATURE_SITE_MONETIZATION_V2,
						FEATURE_PRIORITY_SUPPORT_V2,
					],
				},
				undefined,
				variation
			),
			more: MORE_FEATURES_LINK,
		},
	};

	Object.defineProperties( plan, {
		displayName: {
			get: () => translate( 'Jetpack Security' ),
		},
		shortName: {
			get: () =>
				translate( 'Security', {
					comment: 'Short name of the Jetpack Security generic plan',
				} ),
		},
		tagline: { get: () => translate( 'Comprehensive WordPress protection' ) },
		description: {
			get: () =>
				translate(
					'Enjoy the peace of mind of complete site security. ' +
						'Easy-to-use, powerful security tools guard your site, so you can focus on your business.'
				),
		},
	} );

	return plan;
};
export const OPTION_PLAN_SECURITY_MONTHLY: ( variation: string ) => SelectorProduct = (
	variation
) => ( {
	...OPTION_PLAN_SECURITY( variation ),
	productSlug: OPTIONS_JETPACK_SECURITY_MONTHLY,
	term: TERM_MONTHLY,
	subtypes: [ PLAN_JETPACK_SECURITY_DAILY_MONTHLY, PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ],
	costProductSlug: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
} );

// Jetpack Backup
export const OPTION_PRODUCT_BACKUP: ( variation: string ) => SelectorProduct = ( variation ) => {
	const plan = {
		productSlug: OPTIONS_JETPACK_BACKUP,
		annualOptionSlug: OPTIONS_JETPACK_BACKUP,
		monthlyOptionSlug: OPTIONS_JETPACK_BACKUP_MONTHLY,
		term: TERM_ANNUALLY,
		type: ITEM_TYPE_PRODUCT,
		subtypes: [ PRODUCT_JETPACK_BACKUP_DAILY, PRODUCT_JETPACK_BACKUP_REALTIME ],
		costProductSlug: PRODUCT_JETPACK_BACKUP_DAILY,
		monthlyProductSlug: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		iconSlug: 'jetpack_backup_v2',
		displayName: translate( 'Jetpack Backup' ),
		shortName: translate( 'Backup', {
			comment: 'Short name of the Jetpack Backup generic product',
		} ),
		tagline: translate( 'Recommended for all sites' ),
		description: translate( 'Never lose a word, image, page, or time worrying about your site.' ),
		buttonLabel: translate( 'Get Backup' ),
		features: {
			items: buildCardFeaturesFromItem(
				[
					FEATURE_BACKUP_V2,
					FEATURE_ONE_CLICK_RESTORE_V2,
					FEATURE_SECURE_STORAGE_V2,
					FEATURE_ACTIVITY_LOG_V2,
					FEATURE_PRIORITY_SUPPORT_V2,
				],
				{ withoutDescription: true, withoutIcon: true },
				variation
			),
		},
	};

	Object.defineProperties( plan, {
		displayName: {
			get: () => translate( 'Jetpack Backup' ),
		},
		shortName: {
			get: () =>
				translate( 'Backup', {
					comment: 'Short name of the Jetpack Backup generic product',
				} ),
		},
		tagline: { get: () => translate( 'Recommended for all sites' ) },
		description: {
			get: () => translate( 'Never lose a word, image, page, or time worrying about your site.' ),
		},
		buttonLabel: { get: () => translate( 'Get Backup' ) },
	} );

	return plan;
};

export const OPTION_PRODUCT_BACKUP_MONTHLY: ( variation: string ) => SelectorProduct = (
	variation
) => ( {
	...OPTION_PRODUCT_BACKUP( variation ),
	productSlug: OPTIONS_JETPACK_BACKUP_MONTHLY,
	term: TERM_MONTHLY,
	subtypes: [ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY, PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ],
	costProductSlug: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
} );

// Jetpack CRM

const CRM_ENTREPRENEUR_PRICE = 17;
const CRM_ENTREPRENEUR_CURRENCY = 'USD';

export const EXTERNAL_PRODUCT_CRM: ( variation: string ) => SelectorProduct = ( variation ) => ( {
	productSlug: PRODUCT_JETPACK_CRM,
	term: TERM_ANNUALLY,
	type: ITEM_TYPE_PRODUCT,
	subtypes: [],
	costProductSlug: PRODUCT_JETPACK_CRM,
	monthlyProductSlug: PRODUCT_JETPACK_CRM,
	iconSlug: [ 'v1', 'v2' ].includes( variation ) ? 'jetpack_crm_dark' : 'jetpack_crm',
	displayName:
		{
			v2: translate( 'Jetpack CRM {{em}}Entrepreneur{{/em}}', {
				components: {
					em: createElement( 'em' ),
				},
			} ),
			i5: translate( 'CRM Entrepreneur' ),
		}[ variation ] || translate( 'Jetpack CRM' ),

	shortName:
		{
			v2: translate( 'Jetpack CRM ' ),
			i5: translate( 'CRM Entrepreneur' ),
		}[ variation ] ||
		translate( 'CRM', {
			comment: 'Short name of the Jetpack CRM',
		} ),
	tagline: translate( 'Manage contacts effortlessly' ),
	// Jetpack CRM isn't considered as a product like others for the time being (and therefore not
	// available via the API). Rather like a third-party product.
	// See pricing in https://jetpackcrm.com/pricing/ (only available in USD)
	displayPrice: variation === 'v1' ? undefined : CRM_ENTREPRENEUR_PRICE,
	displayCurrency: variation === 'v1' ? undefined : CRM_ENTREPRENEUR_CURRENCY,
	description: translate(
		'The most simple and powerful WordPress CRM. Improve customer relationships and increase profits.'
	),
	buttonLabel: variation === 'v1' ? translate( 'Get Jetpack CRM' ) : translate( 'Get CRM' ),
	features: {
		items: buildCardFeaturesFromItem(
			[
				FEATURE_CRM_LEADS_AND_FUNNEL,
				FEATURE_CRM_PROPOSALS_AND_INVOICES,
				FEATURE_CRM_TRACK_TRANSACTIONS,
				FEATURE_CRM_NO_CONTACT_LIMITS,
				FEATURE_CRM_PRIORITY_SUPPORT,
			],
			{ withoutDescription: true, withoutIcon: true },
			variation
		),
	},
	hidePrice: true,
	externalUrl: 'https://jetpackcrm.com/pricing/',
} );

export const EXTERNAL_PRODUCT_CRM_MONTHLY: ( variation: string ) => SelectorProduct = (
	variation
) => ( {
	...EXTERNAL_PRODUCT_CRM( variation ),
	productSlug: PRODUCT_JETPACK_CRM_MONTHLY,
	term: TERM_MONTHLY,
	displayTerm: TERM_ANNUALLY,
	subtypes: [],
	costProductSlug: PRODUCT_JETPACK_CRM_MONTHLY,
} );

// Map slug to objects.
export const OPTIONS_SLUG_MAP: Record<
	SelectorProductSlug,
	( variation: string ) => SelectorProduct
> = {
	[ OPTIONS_JETPACK_SECURITY ]: OPTION_PLAN_SECURITY,
	[ OPTIONS_JETPACK_SECURITY_MONTHLY ]: OPTION_PLAN_SECURITY_MONTHLY,
	[ OPTIONS_JETPACK_BACKUP ]: OPTION_PRODUCT_BACKUP,
	[ OPTIONS_JETPACK_BACKUP_MONTHLY ]: OPTION_PRODUCT_BACKUP_MONTHLY,
};

// List of products showcased in the Plans grid but not sold through Calypso
export const EXTERNAL_PRODUCTS_LIST = [ PRODUCT_JETPACK_CRM, PRODUCT_JETPACK_CRM_MONTHLY ];

// External Product slugs to SelectorProduct.
export const EXTERNAL_PRODUCTS_SLUG_MAP: Record<
	string,
	( variation: string ) => SelectorProduct
> = {
	[ PRODUCT_JETPACK_CRM ]: EXTERNAL_PRODUCT_CRM,
	[ PRODUCT_JETPACK_CRM_MONTHLY ]: EXTERNAL_PRODUCT_CRM_MONTHLY,
};

/**
 * Constants that contain products including option and regular types.
 */

export const SELECTOR_PLANS_ALT_V1 = [
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
];

export const SELECTOR_PLANS_ALT_V2 = [
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
];

export const SELECTOR_PLANS_I5 = [
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
];

export const SELECTOR_PLANS_SPP = [
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
];

export const FEATURE_TO_PRODUCT_ALT_V2: Record< string, string > = {
	[ FEATURE_PRODUCT_BACKUP_DAILY_V2 ]: PRODUCT_JETPACK_BACKUP_DAILY,
	[ FEATURE_PRODUCT_BACKUP_REALTIME_V2 ]: PRODUCT_JETPACK_BACKUP_REALTIME,
	[ FEATURE_PRODUCT_SCAN_V2 ]: PRODUCT_JETPACK_SCAN,
	[ FEATURE_PRODUCT_ANTISPAM_V2 ]: PRODUCT_JETPACK_ANTI_SPAM,
	[ FEATURE_SEARCH_V2 ]: PRODUCT_JETPACK_SEARCH,
	[ FEATURE_PRODUCT_SEARCH_V2 ]: PRODUCT_JETPACK_SEARCH,
	[ FEATURE_CRM_V2 ]: PRODUCT_JETPACK_CRM,
};

export const FEATURE_TO_MONTHLY_PRODUCT_ALT_V2: Record< string, string > = {
	[ FEATURE_PRODUCT_BACKUP_DAILY_V2 ]: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	[ FEATURE_PRODUCT_BACKUP_REALTIME_V2 ]: PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	[ FEATURE_PRODUCT_SCAN_V2 ]: PRODUCT_JETPACK_SCAN_MONTHLY,
	[ FEATURE_PRODUCT_ANTISPAM_V2 ]: PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	[ FEATURE_SEARCH_V2 ]: PRODUCT_JETPACK_SEARCH_MONTHLY,
	[ FEATURE_PRODUCT_SEARCH_V2 ]: PRODUCT_JETPACK_SEARCH_MONTHLY,
	[ FEATURE_CRM_V2 ]: PRODUCT_JETPACK_CRM_MONTHLY,
};

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
export const PRODUCT_UPSELLS_BY_FEATURE: Record< string, JetpackPlanSlugs > = {
	[ FEATURE_GOOGLE_ANALYTICS ]: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	[ FEATURE_VIDEO_UPLOADS_JETPACK_PRO ]: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	[ FEATURE_ADVANCED_SEO ]: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	[ FEATURE_ACTIVITY_LOG ]: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
};

/**
 * Array of product slugs that get the highlight treatment.
 */
export const FEATURED_PRODUCTS: string[] = [
	OPTIONS_JETPACK_SECURITY,
	OPTIONS_JETPACK_SECURITY_MONTHLY,
];

/**
 * Matrix that connects real products and plans to their option versions.
 */
export const SUBTYPE_TO_OPTION: Record< string, string > = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: OPTIONS_JETPACK_BACKUP,
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: OPTIONS_JETPACK_BACKUP,
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: OPTIONS_JETPACK_BACKUP_MONTHLY,
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: OPTIONS_JETPACK_BACKUP_MONTHLY,
	[ PLAN_JETPACK_SECURITY_DAILY ]: OPTIONS_JETPACK_SECURITY,
	[ PLAN_JETPACK_SECURITY_REALTIME ]: OPTIONS_JETPACK_SECURITY,
	[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ]: OPTIONS_JETPACK_SECURITY_MONTHLY,
	[ PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ]: OPTIONS_JETPACK_SECURITY_MONTHLY,
};

/*
 * Constants that contain products that have real-time and daily options.
 */
export const DAILY_PRODUCTS = [
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
];

export const REALTIME_PRODUCTS = [
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
];

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
