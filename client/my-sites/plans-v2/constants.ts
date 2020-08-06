/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

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
