/**
 * Internal dependencies
 */
import * as MockData from '../';
import type {
	PricedAPIPlanFree,
	PricedAPIPlanPaidAnnually,
	PricedAPIPlanPaidMonthly,
	DetailsAPIResponse,
	APIPlanDetail,
} from '../../types';

/**
 * For the sake of testing, only a few plans are mocked:
 * - Free plan
 * - Premium plan (annually and monthly billed)
 */

//==============================================================================
// Mock TypeScript interfaces
// (allow us to use real-ish APIs data without TypeScript complaining about
// extra props that are otherwise ignored in this data-store)
//==============================================================================
interface MockPricedAPIPlanFree extends PricedAPIPlanFree {
	[ key: string ]: unknown;
}
interface MockAPIPlanDetail extends APIPlanDetail {
	[ key: string ]: unknown;
}
interface MockDetailsAPIResponse extends DetailsAPIResponse {
	plans: MockAPIPlanDetail[];
	[ key: string ]: unknown;
}
interface MockPricedAPIPlanPaidAnnually extends PricedAPIPlanPaidAnnually {
	[ key: string ]: unknown;
}
interface MockPricedAPIPlanPaidMonthly extends PricedAPIPlanPaidMonthly {
	[ key: string ]: unknown;
}

// All plans details (from APIs)
export const API_PLAN_DETAILS: MockDetailsAPIResponse = {
	groups: [
		{
			slug: 'personal',
			name: 'Personal',
		},
	],
	plans: [
		{
			support_priority: 1,
			support_name: 'free',
			groups: [ 'personal' ],
			products: [
				{
					plan_id: 1,
				},
			],
			name: 'WordPress.com Free',
			short_name: 'Free',
			nonlocalized_short_name: 'Free',
			tagline: 'Mock free plan',
			description:
				'If you just want to start creating, get a free site and be on your way to publishing in less than five minutes.',
			features: [ 'subdomain' ],
			highlighted_features: [ 'Free plan highlighted feature' ],
			storage: '3 GB',
			icon: 'https://s0.wordpress.com/i/store/mobile/plans-free.png',
		},
		{
			support_priority: 4,
			support_name: 'premium',
			groups: [ 'business' ],
			products: [
				{
					plan_id: 1003,
				},
				{
					plan_id: 1013,
				},
			],
			name: 'WordPress.com Premium',
			short_name: 'Premium',
			nonlocalized_short_name: 'Premium',
			tagline: 'Mock premium plan',
			description:
				'Build a unique website with advanced design tools, CSS editing, lots of space for audio and video, and the ability to monetize your site with ads.',
			features: [ 'custom-domain', 'support-live', 'recurring-payments', 'wordads' ],
			highlighted_features: [
				MockData.API_FEATURE_CUSTOM_DOMAIN.name,
				MockData.API_FEATURE_LIVE_SUPPORT.name,
				'Premium plan highlighted feature',
			],
			storage: '13 GB',
			icon: 'https://s0.wordpress.com/i/store/mobile/plans-premium.png',
		},
	],
	features_by_type: [
		MockData.API_FEATURES_BY_TYPE_GENERAL,
		MockData.API_FEATURES_BY_TYPE_COMMERCE,
		MockData.API_FEATURES_BY_TYPE_MARKETING,
	],
	features: [
		MockData.API_FEATURE_CUSTOM_DOMAIN,
		MockData.API_FEATURE_LIVE_SUPPORT,
		MockData.API_FEATURE_PRIORITY_SUPPORT,
		MockData.API_FEATURE_RECURRING_PAYMENTS,
		MockData.API_FEATURE_WORDADS,
	],
};

// Individual plan (from APIs)

export const API_PLAN_PRICE_FREE: MockPricedAPIPlanFree = {
	product_id: 1,
	product_name: 'WordPress.com Free',
	meta: null,
	prices: {
		USD: 0,
		AUD: 0,
		CAD: 0,
		EUR: 0,
		GBP: 0,
		JPY: 0,
		BRL: 0,
		PHP: 0,
		IDR: 0,
		MXN: 0,
		NZD: 0,
		INR: 0,
		ILS: 0,
		RUB: 0,
		SEK: 0,
		HUF: 0,
		CHF: 0,
		CZK: 0,
		DKK: 0,
		HKD: 0,
		NOK: 0,
		PLN: 0,
		SGD: 0,
		TWD: 0,
		THB: 0,
		TRY: 0,
	},
	cost: 0,
	blog_id: null,
	path_slug: 'free',
	product_slug: 'free_plan',
	description: '',
	bill_period: -1,
	product_type: 'bundle',
	available: 'yes',
	multi: 0,
	bd_slug: 'wp-free-plan',
	bd_variation_slug: 'wp-bundles',
	outer_slug: null,
	extra: null,
	capability: 'manage_options',
	product_name_short: 'Free',
	icon: 'https://s0.wordpress.com/i/store/plan-free.png',
	icon_active: 'https://s0.wordpress.com/i/store/plan-free-active.png',
	cost__from_plan: 0,
	currency__from_plan: 'EUR',
	initial_cost_matched: true,
	bill_period_label: 'for life',
	price: '€0',
	formatted_price: '€0',
	raw_price: 0,
	tagline: 'Perfect for anyone creating a basic blog or site',
	currency_code: 'EUR',
	features_highlight: [
		{
			items: [ 'free-blog', 'space', 'support' ],
		},
	],
};

export const API_PLAN_PRICE_PREMIUM_ANNUALLY: MockPricedAPIPlanPaidAnnually = {
	product_id: 1003,
	product_name: 'WordPress.com Premium',
	meta: null,
	prices: {
		USD: 96,
		AUD: 120,
		CAD: 120,
		JPY: 10800,
		EUR: 96,
		GBP: 84,
		BRL: 312,
		HUF: 27000,
		MXN: 1620,
		NZD: 120,
		RUB: 6600,
		ILS: 336,
		SEK: 840,
		INR: 4200,
		PHP: 4992,
		PLN: 399,
		CHF: 96,
		CZK: 2280,
		DKK: 624,
		TWD: 2880,
		THB: 3348,
		HKD: 756,
		NOK: 840,
		SGD: 132,
		IDR: 1072800,
		TRY: 299,
	},
	cost: 96,
	blog_id: null,
	path_slug: 'premium',
	product_slug: 'value_bundle',
	description: '',
	bill_period: 365,
	product_type: 'bundle',
	available: 'yes',
	multi: 0,
	bd_slug: 'wp-bundles',
	bd_variation_slug: 'wp-value-bundle',
	outer_slug: null,
	extra: '',
	capability: 'manage_options',
	product_name_short: 'Premium',
	icon: 'https://s0.wordpress.com/i/store/plan-premium.png',
	icon_active: 'https://s0.wordpress.com/i/store/plan-premium-active.png',
	bundle_product_ids: [
		9,
		12,
		45,
		15,
		5,
		49,
		50,
		6,
		46,
		54,
		56,
		57,
		58,
		59,
		60,
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
		76,
		75,
		16,
	],
	cost__from_plan: 96,
	currency__from_plan: 'EUR',
	initial_cost_matched: true,
	bill_period_label: 'per year',
	price: '€96',
	formatted_price: '€96',
	raw_price: 96,
	tagline: 'Perfect for bloggers, creatives, and other professionals',
	currency_code: 'EUR',
	features_highlight: [
		{
			items: [
				'custom-design',
				'videopress',
				'support',
				'space',
				'custom-domain',
				'no-adverts/no-adverts.php',
			],
		},
		{
			title: 'Included with all plans',
			items: [ 'free-blog' ],
		},
	],
};

export const API_PLAN_PRICE_PREMIUM_MONTHLY: MockPricedAPIPlanPaidMonthly = {
	product_id: 1013,
	product_name: 'WordPress.com Premium',
	meta: null,
	prices: {
		USD: 14,
		IDR: 89400,
		JPY: 1248,
		EUR: 14,
		GBP: 12.6,
		BRL: 49.7,
		NZD: 20.3,
		AUD: 20.3,
		CAD: 18.9,
		INR: 980,
		ILS: 53.2,
		RUB: 910,
		MXN: 280,
		SEK: 154,
		HUF: 4550,
		CHF: 14,
		CZK: 336,
		DKK: 101.5,
		HKD: 112,
		NOK: 140,
		PHP: 770,
		PLN: 56,
		SGD: 21,
		TWD: 448,
		THB: 490,
		TRY: 77,
	},
	cost: 14,
	blog_id: null,
	product_slug: 'value_bundle_monthly',
	description: '',
	bill_period: 31,
	product_type: 'bundle',
	available: 'yes',
	multi: 0,
	bd_slug: 'wp-bundles',
	bd_variation_slug: 'wp-value-bundle-monthly',
	outer_slug: null,
	extra: null,
	capability: 'manage_options',
	product_name_short: 'Premium',
	bundle_product_ids: [ 9, 12, 45, 15, 6, 16, 49, 50 ],
	cost__from_plan: 14,
	currency__from_plan: 'EUR',
	initial_cost_matched: true,
	bill_period_label: 'per month',
	price: '€14',
	formatted_price: '€14',
	raw_price: 14,
	tagline: null,
	currency_code: 'EUR',
};
