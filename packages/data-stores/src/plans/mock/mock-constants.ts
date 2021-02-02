/**
 * Internal dependencies
 */
import type {
	Plan,
	PlanProduct,
	FeaturesByType,
	PlanSimplifiedFeature,
	PricedAPIPlan,
	DetailsAPIResponse,
} from '../types';

/**
 * This file contains mock data for the plans data-store unit tests.
 * There 2 main sections:
 * - APIs: mocks of the data returned by the REST APIs
 * - Data-store objects: mocks of the objects that are created by the
 *   data-store's resolvers when reading/transforming plan APIs data
 *
 * For the sake of testing, only a few plans are mocked:
 * - Free plan
 * - Premium plan (annually and monthly billed)
 */

//==============================================================================
// APIs
//==============================================================================

// Individual Features
export const MOCK_FEATURE_CUSTOM_DOMAIN = {
	id: 'custom-domain',
	name: 'Free domain for One Year',
	description:
		'Get a free domain for one year. Premium domains not included. Your domain will renew at its regular price.',
};
export const MOCK_FEATURE_LIVE_SUPPORT = {
	id: 'support-live',
	name: 'Live chat support',
	description:
		'High quality support to help you get your website up and running and working how you want it.',
};
export const MOCK_FEATURE_PRIORITY_SUPPORT = {
	id: 'priority-support',
	name: '24/7 Priority live chat support',
	description: 'Receive faster support from our WordPress experts - weekends included.',
};
export const MOCK_FEATURE_RECURRING_PAYMENTS = {
	id: 'recurring-payments',
	name: 'Sell subscriptions (recurring payments)',
	description: 'Accept one-time, monthly or annual payments on your website.',
};
export const MOCK_FEATURE_WORDADS = {
	id: 'wordads',
	name: 'WordAds',
	description: 'Put your site to work and earn through ad revenue.',
};

// Feature groups (by type)
export const MOCK_FEATURES_BY_TYPE_GENERAL: FeaturesByType = {
	id: 'general',
	name: null,
	features: [
		MOCK_FEATURE_CUSTOM_DOMAIN.id,
		MOCK_FEATURE_LIVE_SUPPORT.id,
		MOCK_FEATURE_PRIORITY_SUPPORT.id,
	],
};
export const MOCK_FEATURES_BY_TYPE_COMMERCE: FeaturesByType = {
	id: 'commerce',
	name: 'Commerce',
	features: [ MOCK_FEATURE_RECURRING_PAYMENTS.id ],
};
export const MOCK_FEATURES_BY_TYPE_MARKETING: FeaturesByType = {
	id: 'marketing',
	name: 'Marketing',
	features: [ MOCK_FEATURE_WORDADS.id ],
};

// All plans details (from APIs)
export const MOCK_PLAN_DETAILS_API: DetailsAPIResponse = {
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
				MOCK_FEATURE_CUSTOM_DOMAIN.name,
				MOCK_FEATURE_LIVE_SUPPORT.name,
				'Premium plan highlighted feature',
			],
			storage: '13 GB',
			icon: 'https://s0.wordpress.com/i/store/mobile/plans-premium.png',
		},
	],
	features_by_type: [
		MOCK_FEATURES_BY_TYPE_GENERAL,
		MOCK_FEATURES_BY_TYPE_COMMERCE,
		MOCK_FEATURES_BY_TYPE_MARKETING,
	],
	features: [
		MOCK_FEATURE_CUSTOM_DOMAIN,
		MOCK_FEATURE_LIVE_SUPPORT,
		MOCK_FEATURE_PRIORITY_SUPPORT,
		MOCK_FEATURE_RECURRING_PAYMENTS,
		MOCK_FEATURE_WORDADS,
	],
};

// Individual plan (from APIs)
// @TODO: path_slug doesn't exist on monthly and free plans
export const MOCK_PLAN_PRICE_APIS_FREE: PricedAPIPlan = {
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
export const MOCK_PLAN_PRICE_APIS_PREMIUM_ANNUALLY: PricedAPIPlan = {
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
export const MOCK_PLAN_PRICE_APIS_PREMIUM_MONTHLY: PricedAPIPlan = {
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

//==============================================================================
// Data-store objects
//==============================================================================

// Plans
export const MOCK_PLAN_FREE: Plan = {
	description: 'Mock free plan',
	features: [
		{
			name: 'Free plan highlighted feature',
			requiresAnnuallyBilledPlan: false,
		},
	],
	storage: '3 GB',
	title: 'Free',
	featuresSlugs: {
		subdomain: true,
	},
	isFree: true,
	isPopular: false,
	periodAgnosticSlug: 'free',
	productIds: [ 1 ],
};
export const MOCK_PLAN_PREMIUM: Plan = {
	description: 'Mock premium plan',
	features: [
		{
			name: MOCK_FEATURE_CUSTOM_DOMAIN.name,
			requiresAnnuallyBilledPlan: true,
		},
		{
			name: MOCK_FEATURE_LIVE_SUPPORT.name,
			requiresAnnuallyBilledPlan: true,
		},
		{
			name: 'Premium plan highlighted feature',
			requiresAnnuallyBilledPlan: false,
		},
	],
	storage: '13 GB',
	title: 'Premium',
	featuresSlugs: {
		'custom-domain': true,
		'support-live': true,
		'recurring-payments': true,
		wordads: true,
	},
	isFree: false,
	isPopular: true,
	periodAgnosticSlug: 'premium',
	productIds: [ 1003, 1013 ],
};

// Plan products
export const MOCK_PLAN_PRODUCT_FREE: PlanProduct = {
	productId: 1,
	billingPeriod: 'ANNUALLY',
	periodAgnosticSlug: 'free',
	storeSlug: 'free_plan',
	rawPrice: 0,
	pathSlug: 'free',
	price: '€0',
	annualPrice: '€0',
};
export const MOCK_PLAN_PRODUCT_PREMIUM_ANNUALLY: PlanProduct = {
	productId: 1003,
	billingPeriod: 'ANNUALLY',
	periodAgnosticSlug: 'premium',
	storeSlug: 'value_bundle',
	rawPrice: 96,
	pathSlug: 'premium',
	price: '€8',
	annualPrice: '€96',
	annualDiscount: 43,
};
// @TODO: path_slug doesn't exist on monthly plan product
export const MOCK_PLAN_PRODUCT_PREMIUM_MONTHLY: PlanProduct = {
	productId: 1013,
	billingPeriod: 'MONTHLY',
	periodAgnosticSlug: 'premium',
	storeSlug: 'value_bundle_monthly',
	rawPrice: 14,
	price: '€14',
	annualPrice: '€168',
	annualDiscount: 43,
};

// Plan "simplified" features
export const MOCK_SIMPLIFIED_FEATURE_CUSTOM_DOMAIN: PlanSimplifiedFeature = {
	name: MOCK_FEATURE_CUSTOM_DOMAIN.name,
	requiresAnnuallyBilledPlan: true,
};
export const MOCK_SIMPLIFIED_FEATURE_LIVE_SUPPORT: PlanSimplifiedFeature = {
	name: MOCK_FEATURE_LIVE_SUPPORT.name,
	requiresAnnuallyBilledPlan: true,
};
export const MOCK_SIMPLIFIED_FEATURE_PRIORITY_SUPPORT: PlanSimplifiedFeature = {
	name: MOCK_FEATURE_PRIORITY_SUPPORT.name,
	requiresAnnuallyBilledPlan: false,
};
