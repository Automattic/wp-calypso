/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Intervals
 */
const day = { value: 'day', label: translate( 'Days' ) };
const week = { value: 'week', label: translate( 'Weeks' ) };
const month = { value: 'month', label: translate( 'Months' ) };
const year = { value: 'year', label: translate( 'Years' ) };

export const intervals = [ day, week, month, year ];

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
const store = {
	label: translate( 'Store' ),
	path: '/store/stats/orders',
	showIntervals: true,
};
const wordads = {
	label: 'Ads',
	path: '/stats/ads',
	showIntervals: true,
};
const googleMyBusiness = {
	label: translate( 'Google My Business' ),
	path: '/google-my-business/stats',
	showIntervals: false,
};

export const navItems = {
	traffic,
	insights,
	store,
	wordads,
	googleMyBusiness,
};

/**
 * Define properties with translatable strings getters
 */
Object.defineProperty( day, 'label', { get: () => translate( 'Days' ) } );
Object.defineProperty( week, 'label', { get: () => translate( 'Weeks' ) } );
Object.defineProperty( month, 'label', { get: () => translate( 'Months' ) } );
Object.defineProperty( year, 'label', { get: () => translate( 'Years' ) } );

Object.defineProperty( traffic, 'label', { get: () => translate( 'Traffic' ) } );
Object.defineProperty( insights, 'label', { get: () => translate( 'Insights' ) } );
Object.defineProperty( store, 'label', { get: () => translate( 'Store' ) } );
Object.defineProperty( wordads, 'label', { get: () => 'Ads' } );
Object.defineProperty( googleMyBusiness, 'label', {
	get: () => translate( 'Google My Business' ),
} );
