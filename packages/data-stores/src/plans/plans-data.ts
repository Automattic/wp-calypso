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
	'Email & basic Live Chat Support',
	'Collect recurring payments',
	'Collect one-time payments',
	'Earn ad revenue',
	'Premium themes',
	'Upload videos',
	'Google Analytics support',
	'Business features (incl. SEO)',
	'Accept Payments in 60+ Countries',
];

export const PLANS_LIST: Record< string, Plan > = {
	[ PLAN_FREE ]: {
		title: translate( 'Free' ) as string,
		productId: 1,
		storeSlug: PLAN_FREE,
		pathSlug: 'beginner',
		features: [ '3 GB storage space' ],
		isFree: true,
	},

	[ PLAN_PERSONAL ]: {
		title: translate( 'Personal' ) as string,
		productId: 1009,
		storeSlug: PLAN_PERSONAL,
		pathSlug: 'personal',
		features: [ '6 GB storage space', ...mainFeatures.slice( 0, 3 ) ],
	},

	[ PLAN_PREMIUM ]: {
		title: translate( 'Premium' ) as string,
		productId: 1003,
		storeSlug: PLAN_PREMIUM,
		pathSlug: 'premium',
		features: [ '13 GB storage space', ...mainFeatures.slice( 0, 8 ) ],
		isPopular: true,
	},

	[ PLAN_BUSINESS ]: {
		title: translate( 'Business' ) as string,
		productId: 1008,
		storeSlug: PLAN_BUSINESS,
		pathSlug: 'business',
		features: [ '200 GB storage space', ...mainFeatures.slice( 0, 9 ) ],
	},

	[ PLAN_ECOMMERCE ]: {
		title: translate( 'eCommerce' ) as string,
		productId: 1011,
		storeSlug: PLAN_ECOMMERCE,
		pathSlug: 'ecommerce',
		features: [ '200 GB storage space', ...mainFeatures ],
	},
};

export type PlanFeature = { name: string; type: string; data: Array< boolean | string > };

export const plansPaths = Object.keys( PLANS_LIST ).map( ( key ) => PLANS_LIST[ key ].pathSlug );

export type PlanDetail = {
	id: string;
	name: string | null;
	features: Array< PlanFeature >;
};

export type PlanDetails = Array< PlanDetail >;

export const planDetails: PlanDetails = [
	{
		id: 'general',
		name: null,
		features: [
			{
				name: 'Free domain for One Year',
				type: 'checkbox',
				data: [ false, true, true, true, true ],
			},
			{
				name: 'Email & basic live chat support',
				type: 'checkbox',
				data: [ false, true, true, true, true ],
			},
			{
				name: '24/7 Priority live chat support',
				type: 'checkbox',
				data: [ false, false, false, true, true ],
			},
			{
				name: 'Preinstalled SSL security',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Jetpack essential features',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Storage',
				type: 'text',
				data: [
					'3 GB storage space',
					'6 GB storage space',
					'13 GB storage space',
					'200 GB storage space',
					'200 GB storage space',
				],
			},
			{
				name: 'Dozens of free designs',
				type: 'checkbox',
				data: [ true, true, true, true, true ],
			},
			{
				name: 'Remove WordPress.com ads',
				type: 'checkbox',
				data: [ false, true, true, true, true ],
			},
			{
				name: 'Unlimited premium themes',
				type: 'checkbox',
				data: [ false, false, true, true, true ],
			},
			{
				name: 'Advanced design customization',
				type: 'checkbox',
				data: [ false, false, true, true, true ],
			},
			{
				name: 'Get personalized help',
				type: 'checkbox',
				data: [ false, false, false, true, true ],
			},
			{
				name: 'Install plugins',
				type: 'checkbox',
				data: [ false, false, false, true, true ],
			},
			{
				name: 'Upload themes',
				type: 'checkbox',
				data: [ false, false, false, true, true ],
			},
			{
				name: 'Remove WordPress.com branding',
				type: 'checkbox',
				data: [ false, false, false, true, true ],
			},
			{
				name: 'Automated backup & one-click rewind',
				type: 'checkbox',
				data: [ false, false, false, true, true ],
			},
			{
				name: 'SFTP and database access',
				type: 'checkbox',
				data: [ false, false, false, true, true ],
			},
		],
	},
	{
		id: 'commerce',
		name: 'Commerce',
		features: [
			{
				name: 'Sell subscriptions (recurring payments)',
				type: 'checkbox',
				data: [ false, true, true, true, true ],
			},
			{
				name: 'Sell single items (simple payments)',
				type: 'checkbox',
				data: [ false, false, true, true, true ],
			},
			{
				name: 'Accept payments in 60+ countries',
				type: 'checkbox',
				data: [ false, false, false, false, true ],
			},
			{
				name: 'Integrations with top shipping carriers',
				type: 'checkbox',
				data: [ false, false, false, false, true ],
			},
			{
				name: 'Sell anything (products and/or services)',
				type: 'checkbox',
				data: [ false, false, false, false, true ],
			},
			{
				name: 'Premium customizable starter themes',
				type: 'checkbox',
				data: [ false, false, false, false, true ],
			},
		],
	},
	{
		id: 'marketing',
		name: 'Marketing',
		features: [
			{
				name: 'WordAds',
				type: 'checkbox',
				data: [ false, false, true, true, true ],
			},
			{
				name: 'Advanced social media tools',
				type: 'checkbox',
				data: [ false, false, true, true, true ],
			},
			{
				name: 'VideoPress support',
				type: 'checkbox',
				data: [ false, false, true, true, true ],
			},
			{
				name: 'SEO tools',
				type: 'checkbox',
				data: [ false, false, false, true, true ],
			},
			{
				name: 'Commerce marketing tools',
				type: 'checkbox',
				data: [ false, false, false, false, true ],
			},
		],
	},
];
