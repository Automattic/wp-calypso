/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	JETPACK_SCAN_PRODUCTS,
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	JETPACK_BACKUP_PRODUCTS,
} from 'lib/products-values/constants';
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
} from 'lib/plans/constants';
import { buildCardFeaturesFromItem } from './utils';

/**
 * Type dependencies
 */
import type { JetpackRealtimePlan } from 'lib/plans/types';
import type { SelectorProduct, SelectorProductSlug, ProductType } from './types';

export const ALL = 'all';
export const PERFORMANCE = 'performance';
export const SECURITY = 'security';

// TODO: update before offer reset launch
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

/*
 * Options displayed in the Product Type filter in the Plans page.
 */
export const PRODUCT_TYPE_OPTIONS = {
	[ SECURITY ]: {
		id: SECURITY,
		label: translate( 'Security' ),
	},
	[ PERFORMANCE ]: {
		id: PERFORMANCE,
		label: translate( 'Performance' ),
	},
	[ ALL ]: {
		id: ALL,
		label: translate( 'All' ),
	},
};

/**
 * Define properties with translatable strings getters.
 */
Object.defineProperties( PRODUCT_TYPE_OPTIONS, {
	[ SECURITY ]: {
		get: () => ( {
			id: SECURITY,
			label: translate( 'Security' ),
		} ),
	},
	[ PERFORMANCE ]: {
		get: () => ( {
			id: PERFORMANCE,
			label: translate( 'Performance' ),
		} ),
	},
	[ ALL ]: {
		get: () => ( {
			id: ALL,
			label: translate( 'All' ),
		} ),
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
export const OPTION_PLAN_SECURITY: SelectorProduct = {
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
		items: buildCardFeaturesFromItem( {
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
		} ),
		more: MORE_FEATURES_LINK,
	},
};
export const OPTION_PLAN_SECURITY_MONTHLY: SelectorProduct = {
	...OPTION_PLAN_SECURITY,
	productSlug: OPTIONS_JETPACK_SECURITY_MONTHLY,
	term: TERM_MONTHLY,
	subtypes: [ PLAN_JETPACK_SECURITY_DAILY_MONTHLY, PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ],
	costProductSlug: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
};

/**
 * Define properties with translatable strings getters.
 */
[ OPTION_PLAN_SECURITY, OPTION_PLAN_SECURITY_MONTHLY ].forEach( ( target ) => {
	Object.defineProperties( target, {
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
} );

// Jetpack Backup
export const OPTION_PRODUCT_BACKUP: SelectorProduct = {
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
			{ withoutDescription: true, withoutIcon: true }
		),
	},
};

export const OPTION_PRODUCT_BACKUP_MONTHLY: SelectorProduct = {
	...OPTION_PRODUCT_BACKUP,
	productSlug: OPTIONS_JETPACK_BACKUP_MONTHLY,
	term: TERM_MONTHLY,
	subtypes: [ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY, PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ],
	costProductSlug: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
};

/**
 * Define properties with translatable strings getters.
 */
[ OPTION_PRODUCT_BACKUP, OPTION_PRODUCT_BACKUP_MONTHLY ].forEach( ( target ) => {
	Object.defineProperties( target, {
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
} );

// Map slug to objects.
export const OPTIONS_SLUG_MAP: Record< SelectorProductSlug, SelectorProduct > = {
	[ OPTIONS_JETPACK_SECURITY ]: OPTION_PLAN_SECURITY,
	[ OPTIONS_JETPACK_SECURITY_MONTHLY ]: OPTION_PLAN_SECURITY_MONTHLY,
	[ OPTIONS_JETPACK_BACKUP ]: OPTION_PRODUCT_BACKUP,
	[ OPTIONS_JETPACK_BACKUP_MONTHLY ]: OPTION_PRODUCT_BACKUP_MONTHLY,
};

/**
 * Provides categorization of products for filters.
 */
const PRODUCTS_TYPE_SECURITY = [
	OPTIONS_JETPACK_BACKUP,
	OPTIONS_JETPACK_BACKUP_MONTHLY,
	...JETPACK_BACKUP_PRODUCTS,
	...JETPACK_SCAN_PRODUCTS,
	...JETPACK_ANTI_SPAM_PRODUCTS,
	OPTIONS_JETPACK_SECURITY,
	OPTIONS_JETPACK_SECURITY_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
];

const PRODUCTS_TYPE_PERFORMANCE = [
	...JETPACK_SEARCH_PRODUCTS,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
];

export const PRODUCTS_TYPES: Record< ProductType, string[] > = {
	[ SECURITY ]: PRODUCTS_TYPE_SECURITY,
	[ PERFORMANCE ]: PRODUCTS_TYPE_PERFORMANCE,
	[ ALL ]: [ ...PRODUCTS_TYPE_SECURITY, ...PRODUCTS_TYPE_PERFORMANCE ],
};

/**
 * Constants that contain products including option and regular types.
 */
export const SELECTOR_PRODUCTS = [
	OPTIONS_JETPACK_BACKUP,
	OPTIONS_JETPACK_BACKUP_MONTHLY,
	...JETPACK_SCAN_PRODUCTS,
	...JETPACK_ANTI_SPAM_PRODUCTS,
	...JETPACK_SEARCH_PRODUCTS,
];

export const SELECTOR_PLANS = [
	OPTIONS_JETPACK_SECURITY,
	OPTIONS_JETPACK_SECURITY_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
];

export const DAILY_PLAN_TO_REALTIME_PLAN: Record< string, JetpackRealtimePlan > = {
	[ PLAN_JETPACK_SECURITY_DAILY ]: PLAN_JETPACK_SECURITY_REALTIME,
	[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ]: PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
};

/**
 * List of plans and products that can be upgraded from daily to real-time
 * through an upgrade nudge.
 */
export const UPGRADEABLE_WITH_NUDGE = [
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
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

export const JETPACK_OFFER_RESET_UPGRADE_NUDGE_DISMISS =
	'jetpack-offer-reset-upgrade-nudge-dismiss';

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
