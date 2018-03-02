/** @format */

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
	traffic: { label: translate( 'Traffic' ), path: '/stats', showIntervals: true },
	insights: { label: translate( 'Insights' ), path: '/stats/insights', showIntervals: false },
	activity: { label: translate( 'Activity' ), path: '/stats/activity', showIntervals: false },
	store: { label: translate( 'Store' ), path: '/store/stats/orders', showIntervals: true },
	'google-my-business': {
		label: 'Google My Business',
		path: '/google-my-business/stats',
		showIntervals: false,
	}, // only show for some cases
};
