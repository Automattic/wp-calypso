/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import {
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
} from 'lib/products-values/constants';
import {
	JETPACK_SECURITY_PLANS,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
} from 'lib/plans/constants';

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

const PRODUCTS_TYPE_SECURITY = [
	...JETPACK_SCAN_PRODUCTS,
	...JETPACK_BACKUP_PRODUCTS,
	...JETPACK_ANTI_SPAM_PRODUCTS,
	...JETPACK_SECURITY_PLANS,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
];

const PRODUCTS_TYPE_PERFORMANCE = [
	...JETPACK_SEARCH_PRODUCTS,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
];

export const PRODUCTS_TYPES = {
	[ SECURITY ]: PRODUCTS_TYPE_SECURITY,
	[ PERFORMANCE ]: PRODUCTS_TYPE_PERFORMANCE,
	[ ALL ]: [ ...PRODUCTS_TYPE_SECURITY, ...PRODUCTS_TYPE_PERFORMANCE ],
};
