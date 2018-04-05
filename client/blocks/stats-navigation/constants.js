/** @format */

/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';

const intervals = [
	{ value: 'day', label: translate( 'Days' ) },
	{ value: 'week', label: translate( 'Weeks' ) },
	{ value: 'month', label: translate( 'Months' ) },
	{ value: 'year', label: translate( 'Years' ) },
];

const navItems = {
	traffic: { label: translate( 'Traffic' ), path: '/stats', showIntervals: true },
	insights: { label: translate( 'Insights' ), path: '/stats/insights', showIntervals: false },
	activity: { label: translate( 'Activity' ), path: '/stats/activity', showIntervals: false },
	store: { label: translate( 'Store' ), path: '/store/stats/orders', showIntervals: true },
};

if ( config.isEnabled( 'google-my-business' ) ) {
	navItems.googleMyBusiness = {
		label: translate( 'Google My Business' ),
		path: '/google-my-business/stats',
		showIntervals: false,
	};
}

export { navItems, intervals };
