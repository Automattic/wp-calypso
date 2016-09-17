import {
	PLANS_RECEIVE,
	PLANS_REQUEST,
	PLANS_REQUEST_SUCCESS,
} from 'state/action-types';

const plans = [
	{
		android_sku: '',
		apple_sku: '',
		available: 'yes',
		bill_period: -1,
		bill_period_label: 'for life',
		cost: 0,
		currency_code: 'USD',
		description: 'The features most needed by WordPress sites\u2014perfectly packaged and optimized for everyone.',
		feature_1: 'Site stats and analytics',
		feature_2: 'Traffic and promotion tools',
		feature_3: 'Centralized dashboard and auto-updates',
		feature_4: 'Brute-force login protection',
		feature_5: 'Uptime monitoring',
		formatted_price: '$0',
		height: 435,
		icon: 'https://s0.wordpress.com/i/store/plan-free.png',
		icon_active: 'https://s0.wordpress.com/i/store/plan-free-active.png',
		price: '$0',
		prices: {
			USD: 0
		},
		product_id: 2002,
		product_name: 'Free',
		product_name_short: 'Free',
		product_slug: 'jetpack_free',
		product_type: 'jetpack',
		raw_price: 0,
		tagline: 'The only way to WordPress',
		width: 500
	},
	{
		android_sku: '',
		apple_sku: '',
		available: 'yes',
		bill_period: 365,
		bill_period_label: 'per year',
		cost: 99,
		currency_code: 'USD',
		description: '',
		feature_1: 'Daily off-site backups',
		feature_2: 'Daily malware scanning',
		feature_3: 'Spam protection',
		feature_4: 'Automated one-click restores',
		feature_5: 'Easy site migration',
		formatted_original_price: '$114',
		formatted_price: '$99',
		height: 435,
		icon: 'https://s0.wordpress.com/i/store/plan-premium.png',
		icon_active: 'https://s0.wordpress.com/i/store/plan-premium-active.png',
		original: 114,
		price: '$99',
		prices: {
			USD: 99
		},
		product_id: 2000,
		product_name: 'Premium',
		product_name_short: 'Premium',
		product_slug: 'jetpack_premium',
		product_type: 'jetpack',
		raw_price: 99,
		saving: 13,
		tagline: 'Simplified WordPress security for sites of all sizes',
		width: 500
	},
	{
		android_sku: '',
		apple_sku: '',
		available: 'yes',
		bill_period: 365,
		bill_period_label: 'per year',
		cost: 299,
		currency_code: 'USD',
		description: '',
		feature_1: 'Realtime off-site backups',
		feature_2: 'Unlimited backup archive',
		feature_3: 'One-click threat resolution',
		feature_4: 'On-demand malware scanning',
		feature_5: 'Advanced polls, ratings, and surveys',
		formatted_original_price: '$915',
		formatted_price: '$299',
		height: 435,
		icon: 'https://s0.wordpress.com/i/store/plan-business.png',
		icon_active: 'https://s0.wordpress.com/i/store/plan-business-active.png',
		original: 915,
		price: '$299',
		prices: {
			USD: 299
		},
		product_id: 2001,
		product_name: 'Professional',
		product_name_short: 'Professional',
		product_slug: 'jetpack_business',
		product_type: 'jetpack',
		raw_price: 299,
		saving: 65,
		tagline: 'The complete and secure WordPress experience',
		width: 500
	},
	{
		android_sku: '',
		apple_sku: '',
		available: 'yes',
		bill_period: 31,
		bill_period_label: 'per month',
		cost: 9,
		currency_code: 'USD',
		description: '',
		feature_1: 'Daily off-site backups',
		feature_2: 'Daily malware scanning',
		feature_3: 'Spam protection',
		feature_4: 'Automated one-click restores',
		feature_5: 'Easy site migration',
		formatted_original_price: '$20',
		formatted_price: '$9',
		height: 435,
		icon: 'https://s0.wordpress.com/i/store/plan-premium.png',
		icon_active: 'https://s0.wordpress.com/i/store/plan-premium-active.png',
		original: 20,
		price: '$9',
		prices: {
			USD: 9
		},
		product_id: 2003,
		product_name: 'Premium',
		product_name_short: 'Premium',
		product_slug: 'jetpack_premium_monthly',
		product_type: 'jetpack',
		raw_price: 9,
		saving: 11,
		tagline: 'Simplified WordPress security for sites of all sizes',
		width: 500
	},
	{
		android_sku: '',
		apple_sku: '',
		available: 'yes',
		bill_period: 31,
		bill_period_label: 'per month',
		cost: 29,
		currency_code: 'USD',
		description: '',
		feature_1: 'Realtime off-site backups',
		feature_2: 'Unlimited backup archive',
		feature_3: 'One-click threat resolution',
		feature_4: 'On-demand malware scanning',
		feature_5: 'Advanced polls, ratings, and surveys',
		formatted_original_price: '$77',
		formatted_price: '$29',
		height: 435,
		icon: 'https://s0.wordpress.com/i/store/plan-business.png',
		icon_active: 'https://s0.wordpress.com/i/store/plan-business-active.png',
		original: 77,
		price: '$29',
		prices: {
			USD: 29
		},
		product_id: 2004,
		product_name: 'Professional',
		product_name_short: 'Professional',
		product_slug: 'jetpack_business_monthly',
		product_type: 'jetpack',
		raw_price: 29,
		saving: 48,
		tagline: 'The complete and secure WordPress experience',
		width: 500
	},
	{
		android_sku: '',
		apple_sku: '',
		available: 'yes',
		bill_period: -1,
		bill_period_label: 'for life',
		capability: 'manage_options',
		cost: 0,
		currency_code: 'USD',
		description: 'Get a free blog and be on your way to publishing your first post in less than five minutes.',
		features_highlight: [
			{
				items: [
					'free-blog',
					'space',
					'support'
				]
			}
		],
		formatted_price: '$0',
		icon: 'https://s0.wordpress.com/i/store/plan-free.png',
		icon_active: 'https://s0.wordpress.com/i/store/plan-free-active.png',
		price: '$0',
		prices: {
			AUD: 0,
			CAD: 0,
			EUR: 0,
			GBP: 0,
			JPY: 0,
			USD: 0
		},
		product_id: 1,
		product_name: 'WordPress.com Free',
		product_name_short: 'Free',
		product_slug: 'free_plan',
		product_type: 'bundle',
		raw_price: 0,
		store: 0,
		tagline: 'Just get started'
	},
	{
		android_sku: 'sub_test_plan_personal_001',
		apple_sku: 'com.wordpress.test.personal.subscription.1year',
		available: 'yes',
		bill_period: 365,
		bill_period_label: 'per year',
		bundle_product_ids: [
			12,
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
		capability: 'manage_options',
		cost: 35.88,
		currency_code: 'USD',
		description: 'Use your own domain and establish your online presence without ads.',
		features_highlight: [
			{
				items: [
					'no-adverts/no-adverts.php',
					'custom-domain',
					'support'
				]
			},
			{
				items: [
					'free-blog'
				],
				title: 'Included with all plans:'
			}
		],
		formatted_price: '$35.88',
		icon: 'https://s0.wordpress.com/i/store/plan-personal.png',
		icon_active: 'https://s0.wordpress.com/i/store/plan-personal-active.png',
		price: '$35.88',
		prices: {
			AUD: 48.44,
			CAD: 48.44,
			EUR: 35.88,
			GBP: 26.91,
			JPY: 4485,
			USD: 35.88
		},
		product_id: 1009,
		product_name: 'WordPress.com Personal',
		product_name_short: 'Personal',
		product_slug: 'personal-bundle',
		product_type: 'bundle',
		raw_price: 65535,
		tagline: 'Get your own domain'
	},
	{
		android_sku: 'sub_test_plan_premium_001',
		apple_sku: 'com.wordpress.test.premium.subscription.1year',
		available: 'yes',
		bill_period: 365,
		bill_period_label: 'per year',
		bundle_product_ids: [
			9,
			12,
			45,
			15,
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
		capability: 'manage_options',
		cost: 99,
		currency_code: 'USD',
		description: 'Your own domain name, powerful customization options, and lots of space for audio and video.',
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
				],
				title: 'Included with all plans'
			}
		],
		formatted_price: '$99',
		height: 250,
		icon: 'https://s0.wordpress.com/i/store/plan-premium.png',
		icon_active: 'https://s0.wordpress.com/i/store/plan-premium-active.png',
		multi: 0,
		price: '$99',
		price_variants: {
			AUD: {
				original: 129,
				price_c: 161.84,
				price_d: 129
			},
			CAD: {
				original: 129,
				price_c: 161.84,
				price_d: 129
			},
			EUR: {
				original: 99,
				price_c: 119.88,
				price_d: 99
			},
			GBP: {
				original: 85,
				price_c: 89.91,
				price_d: 85
			},
			JPY: {
				original: 11800,
				price_c: 14985,
				price_d: 11800
			},
			USD: {
				original: 99,
				price_c: 119.88,
				price_d: 99
			}
		},
		prices: {
			AUD: 129,
			CAD: 129,
			EUR: 99,
			GBP: 85,
			JPY: 11800,
			NZD: 139,
			USD: 99
		},
		product_id: 1003,
		product_name: 'WordPress.com Premium',
		product_name_short: 'Premium',
		product_slug: 'value_bundle',
		product_type: 'bundle',
		raw_price: 16998,
		store: 0,
		support_document: 'bundles',
		tagline: 'Supercharge your site',
		width: 500
	},
	{
		android_sku: 'sub_test_plan_business_001',
		apple_sku: 'com.wordpress.test.business.subscription.1year',
		available: 'yes',
		bill_period: 365,
		bill_period_label: 'per year',
		bundle_product_ids: [
			12,
			45,
			15,
			48,
			50,
			49,
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
		capability: 'manage_options',
		cost: 299,
		currency_code: 'USD',
		description: 'Everything included with Premium, as well as live chat support, and unlimited access to our premium themes.',
		features_highlight: [
			{
				items: [
					'premium-themes',
					'space',
					'support'
				]
			},
			{
				items: [
					'custom-design',
					'videopress',
					'no-adverts/no-adverts.php',
					'custom-domain'
				],
				title: 'Includes WordPress.com Premium features:'
			},
			{
				items: [
					'free-blog'
				],
				title: 'Included with all plans:'
			}
		],
		formatted_price: '$299',
		height: 435,
		icon: 'https://s0.wordpress.com/i/store/plan-business.png',
		icon_active: 'https://s0.wordpress.com/i/store/plan-business-active.png',
		price: '$299',
		price_variants: {
			AUD: {
				original: 399,
				price_c: 404.84,
				price_d: 323.84
			},
			CAD: {
				original: 389,
				price_c: 404.84,
				price_d: 323.84
			},
			EUR: {
				original: 299,
				price_c: 299.88,
				price_d: 239.88
			},
			GBP: {
				original: 250,
				price_c: 224.91,
				price_d: 179.91
			},
			JPY: {
				original: 35800,
				price_c: 37485,
				price_d: 29985
			},
			USD: {
				original: 299,
				price_c: 299.88,
				price_d: 239.88
			}
		},
		prices: {
			AUD: 399,
			CAD: 389,
			EUR: 299,
			GBP: 250,
			JPY: 35800,
			NZD: 399,
			USD: 299
		},
		product_id: 1008,
		product_name: 'WordPress.com Business',
		product_name_short: 'Business',
		product_slug: 'business-bundle',
		product_type: 'bundle',
		raw_price: 299,
		tagline: 'Take it to the next level',
		width: 500
	}
];

export const requestPlans = ( { dispatch } ) => () => {
	dispatch( { type: PLANS_REQUEST_SUCCESS } );
	dispatch( { type: PLANS_RECEIVE, plans } );
};

export default [ PLANS_REQUEST, requestPlans ];
