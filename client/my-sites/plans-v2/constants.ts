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
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
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
} from 'lib/plans/constants';

/**
 * Type dependencies
 */
import { SelectorProduct, SelectorProductSlug, ProductType } from './types';

export const ALL = 'all';
export const PERFORMANCE = 'performance';
export const SECURITY = 'security';

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
 * Plans and products that have options and can't be purchased themselves.
 */
export const OPTIONS_JETPACK_SECURITY = 'jetpack_security';
export const OPTIONS_JETPACK_SECURITY_MONTHLY = 'jetpack_security_monthly';
export const OPTIONS_JETPACK_BACKUP = 'jetpack_backup';
export const OPTIONS_JETPACK_BACKUP_MONTHLY = 'jetpack_backup_monthly';

export const PRODUCTS_WITH_OPTIONS = [
	OPTIONS_JETPACK_SECURITY,
	OPTIONS_JETPACK_SECURITY_MONTHLY,
	OPTIONS_JETPACK_BACKUP,
	OPTIONS_JETPACK_BACKUP_MONTHLY,
] as const;

// Jetpack Security
export const OPTION_PLAN_SECURITY: SelectorProduct = {
	productSlug: OPTIONS_JETPACK_SECURITY,
	term: TERM_ANNUALLY,
	subtypes: [ PLAN_JETPACK_SECURITY_DAILY, PLAN_JETPACK_SECURITY_REALTIME ],
	costProductSlug: PLAN_JETPACK_SECURITY_DAILY,
	monthlyProductSlug: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	iconSlug: 'jetpack_security_v2',
	displayName: translate( 'Jetpack Security' ),
	tagline: translate( 'Comprehensive WordPress protection' ),
	description: translate(
		'Enjoy the peace of mind of complete site security. ' +
			'Easy-to-use, powerful security tools guard your site, so you can focus on your business.'
	),
	features: [],
};
export const OPTION_PLAN_SECURITY_MONTHLY: SelectorProduct = {
	...OPTION_PLAN_SECURITY,
	productSlug: OPTIONS_JETPACK_SECURITY_MONTHLY,
	term: TERM_MONTHLY,
	subtypes: [ PLAN_JETPACK_SECURITY_DAILY_MONTHLY, PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ],
	costProductSlug: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
};

// Jetpack Backup
export const OPTION_PRODUCT_BACKUP: SelectorProduct = {
	productSlug: OPTIONS_JETPACK_BACKUP,
	term: TERM_ANNUALLY,
	subtypes: [ PRODUCT_JETPACK_BACKUP_DAILY, PRODUCT_JETPACK_BACKUP_REALTIME ],
	costProductSlug: PRODUCT_JETPACK_BACKUP_DAILY,
	monthlyProductSlug: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	iconSlug: 'jetpack_backup_v2',
	displayName: translate( 'Jetpack Backup' ),
	tagline: '',
	description: '',
	features: [],
};
export const OPTION_PRODUCT_BACKUP_MONTHLY: SelectorProduct = {
	...OPTION_PRODUCT_BACKUP,
	productSlug: OPTIONS_JETPACK_BACKUP_MONTHLY,
	term: TERM_MONTHLY,
	subtypes: [ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY, PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ],
	costProductSlug: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
};

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
	...JETPACK_SCAN_PRODUCTS,
	...JETPACK_ANTI_SPAM_PRODUCTS,
	OPTIONS_JETPACK_SECURITY,
	OPTIONS_JETPACK_SECURITY_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
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
