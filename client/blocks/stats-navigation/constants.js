/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

export const intervals = [
	{ value: 'day', label: translate( 'Days' ) },
	{ value: 'week', label: translate( 'Weeks' ) },
	{ value: 'month', label: translate( 'Months' ) },
	{ value: 'year', label: translate( 'Years' ) },
];

export const navItems = {
	traffic: {
		label: translate( 'Traffic' ),
		path: '/stats',
		showIntervals: true,
	},
	insights: {
		label: translate( 'Insights' ),
		path: '/stats/insights',
		showIntervals: false,
	},
	store: {
		label: translate( 'Store' ),
		path: '/store/stats/orders',
		showIntervals: true,
	},
	wordads: {
		label: 'Ads',
		path: '/stats/ads',
		showIntervals: true,
	},
	googleMyBusiness: {
		label: translate( 'Google My Business' ),
		path: '/google-my-business/stats',
		showIntervals: false,
	},
};
