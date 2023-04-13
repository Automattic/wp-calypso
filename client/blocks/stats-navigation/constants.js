import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';

/**
 * Intervals
 */
const hour = { value: 'hour', label: translate( 'Hours' ) };
const day = { value: 'day', label: translate( 'Days' ) };
const week = { value: 'week', label: translate( 'Weeks' ) };
const month = { value: 'month', label: translate( 'Months' ) };
const year = { value: 'year', label: translate( 'Years' ) };

export const intervals = [ day, week, month, year ];
export const emailIntervals = [ hour, day ];

/**
 * Nav items
 */
const traffic = {
	label: translate( 'Traffic' ),
	path: '/stats',
	showIntervals: true,
};
const insights = {
	label: translate( 'Insights' ),
	path: '/stats/insights',
	showIntervals: false,
};
// TODO: Consider adding subscriber counts into this nav item in the future.
// See client/blocks/subscribers-count/index.jsx.
const subscribers = {
	label: translate( 'Subscribers' ),
	path: '/stats/subscribers',
	showIntervals: false,
};
const store = {
	label: translate( 'Store' ),
	path: '/store/stats/orders',
	showIntervals: true,
};
const wordads = {
	label: translate( 'Ads' ),
	path: '/stats/ads',
	showIntervals: true,
};
const googleMyBusiness = {
	label: translate( 'Google My Business' ),
	path: '/google-my-business/stats',
	showIntervals: false,
};

const assembleNavItems = () => {
	const navItems = {
		traffic,
		insights,
		store,
		wordads,
		googleMyBusiness,
	};

	if ( config.isEnabled( 'stats/subscribers-section' ) ) {
		navItems.subscribers = subscribers;
	}

	return navItems;
};

export const navItems = assembleNavItems();

/**
 * Define properties with translatable strings getters
 */
Object.defineProperty( hour, 'label', { get: () => translate( 'Hours' ) } );
Object.defineProperty( day, 'label', { get: () => translate( 'Days' ) } );
Object.defineProperty( week, 'label', { get: () => translate( 'Weeks' ) } );
Object.defineProperty( month, 'label', { get: () => translate( 'Months' ) } );
Object.defineProperty( year, 'label', { get: () => translate( 'Years' ) } );

Object.defineProperty( traffic, 'label', { get: () => translate( 'Traffic' ) } );
Object.defineProperty( insights, 'label', { get: () => translate( 'Insights' ) } );
Object.defineProperty( store, 'label', { get: () => translate( 'Store' ) } );
Object.defineProperty( wordads, 'label', { get: () => translate( 'Ads' ) } );
Object.defineProperty( googleMyBusiness, 'label', {
	get: () => translate( 'Google My Business' ),
} );
