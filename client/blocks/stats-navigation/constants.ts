import { commentAuthorAvatar, search, video } from '@wordpress/icons';
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

export type ModuleToggleItem = {
	key: string;
	label: string;
	icon: JSX.Element;
	defaultValue: boolean;
	disabled: boolean;
};

export const AVAILABLE_PAGE_MODULES: Record< string, ModuleToggleItem[] > = {
	traffic: [
		{
			key: 'authors',
			get label() {
				return translate( 'Authors' );
			},
			icon: commentAuthorAvatar,
			defaultValue: true,
			disabled: false,
		},
		{
			key: 'search-terms',
			get label() {
				return translate( 'Search terms' );
			},
			icon: search,
			defaultValue: false,
			disabled: false,
		},
		{
			key: 'videos',
			get label() {
				return translate( 'Videos' );
			},
			icon: video,
			defaultValue: true,
			disabled: false,
		},
	],
};

/**
 * Nav items
 */
type NavItem = {
	label: string;
	path: string;
	showIntervals: boolean;
	paywall?: boolean;
};
const traffic = {
	label: translate( 'Traffic' ),
	path: '/stats',
	showIntervals: true,
	paywall: true,
} as NavItem;

const insights = {
	label: translate( 'Insights' ),
	path: '/stats/insights',
	showIntervals: false,
	paywall: true,
} as NavItem;

// TODO: Consider adding subscriber counts into this nav item in the future.
// See client/blocks/subscribers-count/index.jsx.
const subscribers = {
	get label() {
		return translate( 'Subscribers' );
	},
	path: '/stats/subscribers',
	showIntervals: false,
} as NavItem;

const store = {
	label: translate( 'Store' ),
	path: '/store/stats/orders',
	showIntervals: true,
} as NavItem;

const wordads = {
	label: translate( 'Ads' ),
	path: '/stats/ads',
	showIntervals: true,
} as NavItem;

const googleMyBusiness = {
	label: translate( 'Google Business Profile' ),
	path: '/google-my-business/stats',
	showIntervals: false,
} as NavItem;

export interface NavItems {
	traffic: NavItem;
	insights: NavItem;
	store: NavItem;
	wordads: NavItem;
	googleMyBusiness: NavItem;
	subscribers?: NavItem;
}

const assembleNavItems = () => {
	const navItems = {
		traffic,
		insights,
		subscribers,
		store,
		wordads,
		googleMyBusiness,
	} as NavItems;

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
	get: () => translate( 'Google Business Profile' ),
} );
