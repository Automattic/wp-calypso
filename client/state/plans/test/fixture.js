/**
 * Action types constantes
 */
import {
	PLANS_RECEIVE,
	PLANS_REQUEST,
	PLANS_REQUEST_SUCCESS,
	PLANS_REQUEST_FAILURE
} from 'state/action-types';

import { getValidDataFromResponse } from '../actions';

// WP REST-API error response
export const ERROR_MESSAGE_RESPONSE = 'There was a problem fetching plans. Please try again later or contact support.';

export const PLAN_1 = {
	product_id: 1,
	product_name: 'WordPress.com Free',
	product_name_en: 'Free',
	prices: { USD: 0, AUD: 0, CAD: 0, EUR: 0, GBP: 0, JPY: 0 },
	product_name_short: 'Free',
	product_slug: 'free_plan',
	tagline: 'Just get started',
	shortdesc: 'Get a free blog and be on your way to publishing your first post in less than five minutes.',
	description: 'Just start blogging: get a free blog and be on your way to publishing your first post in less than five minutes.',
	icon: 'https://s0.wordpress.com/i/store/plan-free.png',
	icon_active: 'https://s0.wordpress.com/i/store/plan-free-active.png',
	capability: 'manage_options',
	cost: 0,
	apple_sku: '',
	android_sku: '',
	bill_period: -1,
	product_type: 'bundle',
	available: 'yes',
	store: 0,
	features_highlight: [
		{
			items: [
				'free-blog',
				'space',
				'support'
			]
		}
	],
	bill_period_label: 'for life',
	price: '$0',
	formatted_price: '$0',
	raw_price: 0
};

export const PLAN_1003 = {
	product_id: 1003,
	product_name: 'WordPress.com Premium',
	product_name_en: 'WordPress.com Premium',
	prices: {
		USD: 99, NZD: 139, AUD: 129, CAD: 129, JPY: 11800, EUR: 99, GBP: 85
	},
	product_name_short: 'Premium',
	product_slug: 'value_bundle',
	tagline: 'Supercharge your site',
	shortdesc: 'Your own domain name, powerful customization options, and lots of space for audio and video.',
	description: 'Get all of these great features to super-charge your blog. Includes a domain name of your choice or domain mapping for an existing domain, VideoPress, Custom Design, 10GB Space Upgrade, and No Ads.',
	icon: 'https://s0.wordpress.com/i/store/plan-premium.png',
	icon_active: 'https://s0.wordpress.com/i/store/plan-premium-active.png',
	capability: 'manage_options',
	cost: 99,
	apple_sku: 'com.wordpress.test.premium.subscription.1year',
	android_sku: 'sub_test_plan_premium_001',
	bill_period: 365,
	product_type: 'bundle',
	available: 'yes',
	store: 0,
	features_highlight: [
		{
			items: [
				'custom-design',
				'videopress',
				'support',
				'space',
				'custom-domain',
				'no-adverts/no-adverts.php'
			]
		},
		{
			items: [
				'free-blog'
			]
		}
	],
	width: 500,
	height: 250,
	multi: 0,
	support_document: 'bundles',
	bundle_product_ids: [
		9, 12, 45, 15, 5, 6, 46, 54, 56, 57, 58, 59,
		60, 61, 62, 63, 64, 65, 66, 67, 68,
		72, 73, 74, 75, 16
	],
	bill_period_label: 'per year',
	price: '$99',
	formatted_price: '$99',
	raw_price: 99
};

export const PLAN_1008 = {
	product_id: 1008,
	product_name: 'WordPress.com Business',
	product_name_en: 'WordPress.com Business',
	prices: {
		USD: 299, NZD: 399, AUD: 399, CAD: 389, JPY: 35800, EUR: 299, GBP: 250
	},
	product_name_short: 'Business',
	product_slug: 'business-bundle',
	tagline: 'Take it to the next level',
	shortdesc: 'Everything included with Premium, as well as live chat support, and unlimited access to our premium themes.',
	description: 'All you need to build a great website:<ul><li>Chat live with a WordPress.com specialist, Monday to Friday between 7am and 7pm Eastern time.</li><li>Try any premium theme and change as often as you like, no extra charge.</li><li>Upload all the video and audio files you want with unlimited storage.</li></ul>Including all the features of WordPress.com Premium:<ul><li>A domain of your choice to replace your site’s default address</li><li>Custom Design to customize your site’s appearance and choose unique fonts and colors</li><li>VideoPress to embed beautiful HD video straight from your dashboard or from your mobile device</li><li>Hides all ads on your site</li></ul>',
	icon: 'https://s0.wordpress.com/i/store/plan-business.png',
	icon_active: 'https://s0.wordpress.com/i/store/plan-business-active.png',
	capability: 'manage_options',
	cost: 299,
	apple_sku: 'com.wordpress.test.business.subscription.1year',
	android_sku: 'sub_test_plan_business_001',
	features_highlight: [
		{
			items: [
				'premium-themes',
				'space',
				'support'
			]
		},
		{
			title: 'Includes WordPress.com Premium features:',
			items: [
				'custom-design',
				'videopress',
				'no-adverts/no-adverts.php',
				'custom-domain'
			]
		},
		{
			title: 'Included with all plans:',
			items: [
				'free-blog'
			]
		}
	],
	bill_period: 365,
	width: 500,
	height: 435,
	product_type: 'bundle',
	available: 'yes',
	bundle_product_ids: [
		12, 45, 15, 48, 50, 49, 5, 6, 46,
		54, 56, 57, 58, 59,
		60, 61, 62, 63, 64, 65, 66, 67, 68,
		72, 73, 74, 75, 16
	],
	bill_period_label: 'per year',
	price: '$299',
	formatted_price: '$299',
	raw_price: 299
};

export const PLAN_1009 = {
	product_id: 1009,
	product_name: "WordPress.com Personal",
	prices: {
		USD: 71.88
	},
	product_name_short: "Personal",
	product_slug: "personal-bundle",
	tagline: "Get your own domain",
	description: "Use your own domain and establish your online presence without ads.",
	icon: "https://s0.wordpress.com/i/store/plan-personal.png",
	icon_active: "https://s0.wordpress.com/i/store/plan-personal-active.png",
	capability: "manage_options",
	cost: 71.88,
	apple_sku: "com.wordpress.test.personal.subscription.1year",
	android_sku: "sub_test_plan_personal_001",
	features_highlight: [
		{
			items: [ "no-adverts/no-adverts.php", "custom-domain", "support", "space" ]
		},
		{
			title : "Included with all plans:",
			items: ["free-blog"]
		}
	],
	bill_period: 365,
	product_type: "bundle",
	available: "yes",
	bundle_product_ids: [
		12,
		9,
		50,
		5,
		6,
		46,
		54,
		56,
		57,
		58,
		59,
		60,
		61,
		62,
		63,
		64,
		65,
		66,
		67,
		68,
		72,
		73,
		74,
		75,
		16
	],
	bill_period_label: "per year",
	price: "$71.88",
	formatted_price: "$71.88",
	raw_price: 71.88,
	currency_code: "USD"
};

export const PLAN_2000 = {
	product_id: 2000,
	product_name: 'Premium',
	product_name_en: 'Premium',
	prices: { USD: 99 },
	product_name_short: 'Premium',
	product_slug: 'jetpack_premium',
	tagline: 'Backup and spam protection',
	shortdesc: 'Keep your site\'s content backed up and secure, and enable state-of-the-art spam filtering.',
	description: 'Daily Backups, Automated Restores and Spam Protection',
	icon: 'https://s0.wordpress.com/i/store/plan-premium.png',
	icon_active: 'https://s0.wordpress.com/i/store/plan-premium-active.png',
	feature_1: 'Automated backups with easy restores',
	feature_2: '30-day backup archive',
	feature_3: 'Help from the WordPress experts',
	cost: 99,
	original: 114,
	saving: 13,
	apple_sku: '',
	android_sku: '',
	bill_period: 365,
	product_type: 'jetpack',
	available: 'yes',
	width: 500,
	height: 435,
	bill_period_label: 'per year',
	price: '$99',
	formatted_price: '$99',
	formatted_original_price: '$114',
	raw_price: 99
};

export const PLAN_2001 = {
	product_id: 2001,
	product_name: 'Business',
	product_name_en: 'Business',
	prices: { USD: 299 },
	product_name_short: 'Business',
	product_slug: 'jetpack_business',
	tagline: 'Faster backups, security scans, and repairs',
	shortdesc: 'Get everything included with Premium, as well as real-time backups, security scans, and more.',
	description: 'Daily Backups, Security Scanning, Spam Protection, Polls and Surveys',
	icon: 'https://s0.wordpress.com/i/store/plan-business.png',
	icon_active: 'https://s0.wordpress.com/i/store/plan-business-active.png',
	feature_1: 'Real-time database backups',
	feature_2: 'Unlimited  backup archive',
	feature_3: 'Daily security scans with one-click repairs',
	cost: 299,
	original: 915,
	saving: 65,
	apple_sku: '',
	android_sku: '',
	bill_period: 365,
	product_type: 'jetpack',
	available: 'yes',
	width: 500,
	height: 435,
	bill_period_label: 'per year',
	price: '$299',
	formatted_price: '$299',
	formatted_original_price: '$915',
	raw_price: 299
};

export const PLAN_2002 = {
	product_id: 2002,
	product_name: 'Free',
	product_name_en: 'Free',
	prices: { USD: 0 },
	product_name_short: 'Free',
	product_slug: 'jetpack_free',
	tagline: 'Get started',
	shortdesc: 'Jetpack (free) speeds up your site\'s images, secures it, and enables traffic and customization tools.',
	description: 'Spam Protection',
	icon: 'https://s0.wordpress.com/i/store/plan-free.png',
	icon_active: 'https://s0.wordpress.com/i/store/plan-free-active.png',
	cost: 0,
	apple_sku: '',
	android_sku: '',
	bill_period: -1,
	product_type: 'jetpack',
	available: 'yes',
	width: 500,
	height: 435,
	bill_period_label: 'for life',
	price: '$0',
	formatted_price: '$0',
	raw_price: 0
};

export const WPCOM_RESPONSE = [
	PLAN_1, PLAN_1003, PLAN_1008, PLAN_1009, PLAN_2000, PLAN_2001, PLAN_2002
];

WPCOM_RESPONSE._headers = {
	'Content-Type': 'application/json',
	Date: new Date().toGMTString()
};

export const PLANS = getValidDataFromResponse( WPCOM_RESPONSE );

// actions
export const ACTION_PLANS_RECEIVE = {
	type: PLANS_RECEIVE,
	plans: PLANS
};

export const ACTION_PLANS_REQUEST = {
	type: PLANS_REQUEST
};

export const ACTION_PLANS_REQUEST_SUCCESS = {
	type: PLANS_REQUEST_SUCCESS
};

export const ACTION_PLANS_REQUEST_FAILURE = {
	type: PLANS_REQUEST_FAILURE,
	error: ERROR_MESSAGE_RESPONSE
};

/**
 * Return a whole state instance
 *
 * - requesting: false
 * - error: false
 *
 * @return {Object} an state instance
 */
export const getStateInstance = () => {
	return {
		plans: {
			items: [ ...PLANS ],
			requesting: false,
			error: false
		}
	};
};
