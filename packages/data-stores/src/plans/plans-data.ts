/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE } from './constants';
import type { Plan } from './types';

const mainFeatures = [
	'Remove WordPress.com ads',
	'Email & basic live chat support',
	'Collect recurring payments',
	'Collect one-time payments',
	'Earn ad revenue',
	'Premium themes',
	'Upload videos',
	'Google Analytics support',
	'Business features (incl. SEO)',
	'Upload themes',
	'Install plugins',
	'Accept payments in 60+ countries',
];

export const PLANS_LIST: Record< string, Plan > = {
	[ PLAN_FREE ]: {
		title: translate( 'Free' ) as string,
		description: translate( 'Create a beautiful, simple website in minutes' ) as string,
		productId: 1,
		storeSlug: PLAN_FREE,
		pathSlug: 'beginner',
		features: [ '3 GB storage space' ],
		isFree: true,
	},

	[ PLAN_PERSONAL ]: {
		title: translate( 'Personal' ) as string,
		description: translate( 'Best for personal use' ) as string,
		productId: 1009,
		storeSlug: PLAN_PERSONAL,
		pathSlug: 'personal',
		features: [ '6 GB storage space', ...mainFeatures.slice( 0, 3 ) ],
	},

	[ PLAN_PREMIUM ]: {
		title: translate( 'Premium' ) as string,
		description: translate( 'Best for freelancers' ) as string,
		productId: 1003,
		storeSlug: PLAN_PREMIUM,
		pathSlug: 'premium',
		features: [ '13 GB storage space', ...mainFeatures.slice( 0, 8 ) ],
		isPopular: true,
	},

	[ PLAN_BUSINESS ]: {
		title: translate( 'Business' ) as string,
		description: translate( 'Best for small businesses' ) as string,
		productId: 1008,
		storeSlug: PLAN_BUSINESS,
		pathSlug: 'business',
		features: [ '200 GB storage space', ...mainFeatures.slice( 0, 11 ) ],
	},

	[ PLAN_ECOMMERCE ]: {
		title: translate( 'eCommerce' ) as string,
		description: translate( 'Best for online stores' ) as string,
		productId: 1011,
		storeSlug: PLAN_ECOMMERCE,
		pathSlug: 'ecommerce',
		features: [ '200 GB storage space', ...mainFeatures ],
	},
};

export type PlanFeature = { name: string; type: string; data: Array< boolean | string > };

export const plansPaths = Object.keys( PLANS_LIST ).map( ( key ) => PLANS_LIST[ key ].pathSlug );
