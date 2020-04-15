/**
 * External dependencies
 */
import React from 'react';
import { compact, includes } from 'lodash';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import * as constants from './constants';

const WPComGetBillingTimeframe = annualPriceText =>
	annualPriceText ? `billed annually` : i18n.translate( 'per month, billed annually' );
const WPComGetBiennialBillingTimeframe = () => i18n.translate( '/month, billed every two years' );

const plansDescriptionHeadingComponent = {
	components: {
		strong: <strong className="plans__features plan-features__targeted-description-heading" />,
	},
};

const getPlanBloggerDetails = () => ( {
	group: constants.GROUP_WPCOM,
	type: constants.TYPE_BLOGGER,
	getTitle: () => i18n.translate( 'Blogger' ),
	// @TODO not updating copy for now, we need to update it after the first round of design {{{
	getAudience: () => i18n.translate( 'Best for bloggers' ),
	getBlogAudience: () => i18n.translate( 'Best for bloggers' ),
	getPortfolioAudience: () => i18n.translate( 'Best for bloggers' ),
	getStoreAudience: () => i18n.translate( 'Best for bloggers' ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for Bloggers:{{/strong}} Brand your blog with a custom .blog domain name, and remove all WordPress.com advertising. Receive additional storage space and email support.',
			plansDescriptionHeadingComponent
		),
	getShortDescription: () =>
		i18n.translate(
			'Brand your blog with a custom .blog domain name, and remove all WordPress.com advertising. Receive additional storage space and email support.'
		),
	// }}}
	getPlanCompareFeatures: () => [
		// pay attention to ordering, shared features should align on /plan page
		constants.FEATURE_BLOG_DOMAIN,
		constants.FEATURE_JETPACK_ESSENTIAL,
		constants.FEATURE_EMAIL_SUPPORT,
		constants.FEATURE_FREE_THEMES,
		constants.FEATURE_BASIC_DESIGN,
		constants.FEATURE_6GB_STORAGE,
		constants.FEATURE_NO_ADS,
	],
	getSignupFeatures: () => [
		constants.FEATURE_EMAIL_SUPPORT_SIGNUP,
		constants.FEATURE_BLOG_DOMAIN,
		constants.FEATURE_ALL_FREE_FEATURES,
	],
	getBlogSignupFeatures: () => [
		constants.FEATURE_FREE_BLOG_DOMAIN,
		constants.FEATURE_EMAIL_SUPPORT_SIGNUP,
		constants.FEATURE_ALL_FREE_FEATURES,
	],
	getPortfolioSignupFeatures: () => [
		constants.FEATURE_FREE_BLOG_DOMAIN,
		constants.FEATURE_EMAIL_SUPPORT_SIGNUP,
		constants.FEATURE_ALL_FREE_FEATURES,
	],
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [ constants.FEATURE_AUDIO_UPLOADS ],
	getInferiorHiddenFeatures: () => [],
} );

const getPlanPersonalDetails = () => ( {
	group: constants.GROUP_WPCOM,
	type: constants.TYPE_PERSONAL,
	getTitle: isEligibleForPlanStepUpdates =>
		isEligibleForPlanStepUpdates ? 'Personal plan' : i18n.translate( 'Personal' ),
	getAudience: isEligibleForPlanStepUpdates =>
		isEligibleForPlanStepUpdates
			? 'WordPress essentials for a basic site.'
			: i18n.translate( 'Best for personal use' ),
	getBlogAudience: () => i18n.translate( 'Best for personal use' ),
	getPortfolioAudience: () => i18n.translate( 'Best for personal use' ),
	getStoreAudience: () => i18n.translate( 'Best for personal use' ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for Personal Use:{{/strong}} Boost your' +
				' website with a custom domain name, and remove all WordPress.com advertising. ' +
				'Get access to high-quality email and live chat support.',
			plansDescriptionHeadingComponent
		),
	getShortDescription: isEligibleForPlanStepUpdates =>
		isEligibleForPlanStepUpdates
			? 'Build your starter online home with basic site-editing tools, a custom domain name, and access to live chat support.'
			: i18n.translate(
					'Boost your website with a custom domain name, and remove all WordPress.com advertising. ' +
						'Get access to high-quality email and live chat support.'
			  ),
	getPlanCompareFeatures: () => [
		// pay attention to ordering, shared features should align on /plan page
		constants.FEATURE_CUSTOM_DOMAIN,
		constants.FEATURE_JETPACK_ESSENTIAL,
		constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
		constants.FEATURE_FREE_THEMES,
		constants.FEATURE_BASIC_DESIGN,
		constants.FEATURE_6GB_STORAGE,
		constants.FEATURE_NO_ADS,
	],
	getSignupFeatures: () => [
		constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP,
		constants.FEATURE_FREE_DOMAIN,
		constants.FEATURE_FREE_THEMES,
	],
	getBlogSignupFeatures: () => [
		constants.FEATURE_FREE_DOMAIN,
		constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP,
		constants.FEATURE_ALL_FREE_FEATURES,
	],
	getPortfolioSignupFeatures: () => [
		constants.FEATURE_FREE_DOMAIN,
		constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP,
		constants.FEATURE_ALL_FREE_FEATURES,
	],
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [ constants.FEATURE_AUDIO_UPLOADS ],
	getInferiorHiddenFeatures: () => [],
} );

const getPlanEcommerceDetails = () => ( {
	group: constants.GROUP_WPCOM,
	type: constants.TYPE_ECOMMERCE,
	getTitle: isEligibleForPlanStepUpdates =>
		isEligibleForPlanStepUpdates ? 'eCommerce plan' : i18n.translate( 'eCommerce' ),
	getAudience: isEligibleForPlanStepUpdates =>
		isEligibleForPlanStepUpdates
			? 'Build a professional online store.'
			: i18n.translate( 'Best for online stores' ),
	getBlogAudience: () => i18n.translate( 'Best for online stores' ),
	getPortfolioAudience: () => i18n.translate( 'Best for online stores' ),
	getStoreAudience: () => i18n.translate( 'Best for online stores' ),
	getDescription: () => {
		return i18n.translate(
			'{{strong}}Best for Online Stores:{{/strong}} Sell products or services with this powerful, ' +
				'all-in-one online store experience. This plan includes premium integrations and is extendable, ' +
				'so it’ll grow with you as your business grows.',
			plansDescriptionHeadingComponent
		);
	},
	getShortDescription: isEligibleForPlanStepUpdates =>
		isEligibleForPlanStepUpdates
			? 'Start selling in no time, and create the best shopping, payment, and delivery experience for your customers.'
			: i18n.translate(
					'Sell products or services with this powerful, ' +
						'all-in-one online store experience. This plan includes premium integrations and is extendable, ' +
						'so it’ll grow with you as your business grows.'
			  ),
	getTagline: () =>
		i18n.translate(
			'Learn more about everything included with eCommerce and take advantage of its powerful marketplace features.'
		),
	getPlanCompareFeatures: () =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			constants.FEATURE_CUSTOM_DOMAIN,
			constants.FEATURE_JETPACK_ADVANCED,
			constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
			constants.FEATURE_UNLIMITED_PREMIUM_THEMES,
			constants.FEATURE_ADVANCED_DESIGN,
			constants.FEATURE_200GB_STORAGE,
			constants.FEATURE_NO_ADS,
			constants.FEATURE_GOOGLE_ANALYTICS,
			isEnabled( 'republicize' ) && constants.FEATURE_REPUBLICIZE,
			constants.FEATURE_SIMPLE_PAYMENTS,
			constants.FEATURE_WORDADS_INSTANT,
			constants.FEATURE_VIDEO_UPLOADS,
			constants.FEATURE_BUSINESS_ONBOARDING,
			constants.FEATURE_ADVANCED_SEO,
			isEnabled( 'automated-transfer' ) && constants.FEATURE_UPLOAD_PLUGINS,
			isEnabled( 'automated-transfer' ) && constants.FEATURE_UPLOAD_THEMES,
			constants.FEATURE_NO_BRANDING,
			constants.FEATURE_ACCEPT_PAYMENTS,
			constants.FEATURE_SHIPPING_CARRIERS,
			constants.FEATURE_UNLIMITED_PRODUCTS_SERVICES,
			constants.FEATURE_ECOMMERCE_MARKETING,
			constants.FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
		] ),
	getPromotedFeatures: () => [
		constants.FEATURE_200GB_STORAGE,
		constants.FEATURE_UNLIMITED_PREMIUM_THEMES,
		constants.FEATURE_CUSTOM_DOMAIN,
		constants.FEATURE_NO_ADS,
		constants.FEATURE_ADVANCED_DESIGN,
		constants.FEATURE_BUSINESS_ONBOARDING,
	],
	getSignupFeatures: () => [
		constants.FEATURE_ACCEPT_PAYMENTS,
		constants.FEATURE_SHIPPING_CARRIERS,
		constants.FEATURE_ALL_BUSINESS_FEATURES,
	],
	getBlogSignupFeatures: () => [
		constants.FEATURE_ACCEPT_PAYMENTS,
		constants.FEATURE_SHIPPING_CARRIERS,
		constants.FEATURE_ALL_BUSINESS_FEATURES,
	],
	getPortfolioSignupFeatures: () => [
		constants.FEATURE_ACCEPT_PAYMENTS,
		constants.FEATURE_SHIPPING_CARRIERS,
		constants.FEATURE_ALL_BUSINESS_FEATURES,
	],
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [
		constants.FEATURE_AUDIO_UPLOADS,
		constants.FEATURE_GOOGLE_MY_BUSINESS,
		constants.FEATURE_UPLOAD_THEMES_PLUGINS,
		constants.FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT,
	],
	getInferiorHiddenFeatures: () => [],
} );

const getPlanPremiumDetails = () => ( {
	group: constants.GROUP_WPCOM,
	type: constants.TYPE_PREMIUM,
	getTitle: isEligibleForPlanStepUpdates =>
		isEligibleForPlanStepUpdates ? 'Premium plan' : i18n.translate( 'Premium' ),
	getAudience: isEligibleForPlanStepUpdates =>
		isEligibleForPlanStepUpdates
			? 'Powerful tools at a great value.'
			: i18n.translate( 'Best for freelancers' ),
	getBlogAudience: () => i18n.translate( 'Best for freelancers' ),
	getPortfolioAudience: () => i18n.translate( 'Best for freelancers' ),
	getStoreAudience: () => i18n.translate( 'Best for freelancers' ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for Freelancers:{{/strong}}' +
				' Build a unique website with advanced design tools, CSS editing, lots of space for audio and video,' +
				' Google Analytics support,' +
				' and the ability to monetize your site with ads.',
			plansDescriptionHeadingComponent
		),
	getShortDescription: isEligibleForPlanStepUpdates =>
		isEligibleForPlanStepUpdates
			? 'Build a sleek site with beautiful themes, robust design and monetization tools, custom CSS, and Google Analytics.'
			: i18n.translate(
					'Build a unique website with advanced design tools, CSS editing, lots of space for audio and video,' +
						' Google Analytics support,' +
						' and the ability to monetize your site with ads.'
			  ),
	getPlanCompareFeatures: () =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			constants.FEATURE_CUSTOM_DOMAIN,
			constants.FEATURE_JETPACK_ESSENTIAL,
			constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
			constants.FEATURE_UNLIMITED_PREMIUM_THEMES,
			constants.FEATURE_ADVANCED_DESIGN,
			constants.FEATURE_13GB_STORAGE,
			constants.FEATURE_NO_ADS,
			constants.FEATURE_GOOGLE_ANALYTICS,
			isEnabled( 'republicize' ) && constants.FEATURE_REPUBLICIZE,
			constants.FEATURE_SIMPLE_PAYMENTS,
			constants.FEATURE_WORDADS_INSTANT,
			constants.FEATURE_VIDEO_UPLOADS,
		] ),
	getPromotedFeatures: () => [
		constants.FEATURE_CUSTOM_DOMAIN,
		constants.FEATURE_NO_ADS,
		constants.FEATURE_ADVANCED_DESIGN,
		constants.FEATURE_13GB_STORAGE,
	],
	getSignupFeatures: () =>
		compact( [
			constants.FEATURE_ADVANCED_CUSTOMIZATION,
			constants.FEATURE_PREMIUM_THEMES,
			constants.FEATURE_ALL_PERSONAL_FEATURES,
		] ),
	getBlogSignupFeatures: () => [
		constants.FEATURE_MONETISE,
		constants.FEATURE_PREMIUM_THEMES,
		constants.FEATURE_ALL_PERSONAL_FEATURES,
	],
	getPortfolioSignupFeatures: () => [
		constants.FEATURE_ADVANCED_CUSTOMIZATION,
		constants.FEATURE_PREMIUM_THEMES,
		constants.FEATURE_ALL_PERSONAL_FEATURES,
	],
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [ constants.FEATURE_AUDIO_UPLOADS ],
	getInferiorHiddenFeatures: () => [],
} );

const getPlanBusinessDetails = () => ( {
	group: constants.GROUP_WPCOM,
	type: constants.TYPE_BUSINESS,
	getTitle: isEligibleForPlanStepUpdates =>
		isEligibleForPlanStepUpdates ? 'Business plan' : i18n.translate( 'Business' ),
	getAudience: isEligibleForPlanStepUpdates =>
		isEligibleForPlanStepUpdates
			? 'All you need for a growing business.'
			: i18n.translate( 'Best for small businesses' ),
	getBlogAudience: () => i18n.translate( 'Best for small businesses' ),
	getPortfolioAudience: () => i18n.translate( 'Best for small businesses' ),
	getStoreAudience: () => i18n.translate( 'The plan for small businesses' ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for Small Businesses:{{/strong}} Power your' +
				' business website with custom plugins and themes, unlimited premium and business theme templates,' +
				' 200 GB storage, and the ability to remove WordPress.com branding.',
			plansDescriptionHeadingComponent
		),
	getShortDescription: isEligibleForPlanStepUpdates =>
		isEligibleForPlanStepUpdates
			? 'The full power of WordPress, unlocked: from plugins and custom themes  to SFTP and phpMyAdmin, this plan has it all.'
			: i18n.translate(
					'Power your business website with custom plugins and themes, unlimited premium and business theme templates,' +
						' 200 GB storage, and the ability to remove WordPress.com branding.'
			  ),
	getTagline: () =>
		i18n.translate(
			'Learn more about everything included with Business and take advantage of its professional features.'
		),
	getPlanCompareFeatures: () =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			constants.FEATURE_CUSTOM_DOMAIN,
			constants.FEATURE_JETPACK_ADVANCED,
			constants.FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
			constants.FEATURE_UNLIMITED_PREMIUM_THEMES,
			constants.FEATURE_ADVANCED_DESIGN,
			constants.FEATURE_200GB_STORAGE,
			constants.FEATURE_NO_ADS,
			constants.FEATURE_GOOGLE_ANALYTICS,
			isEnabled( 'republicize' ) && constants.FEATURE_REPUBLICIZE,
			constants.FEATURE_SIMPLE_PAYMENTS,
			constants.FEATURE_WORDADS_INSTANT,
			constants.FEATURE_VIDEO_UPLOADS,
			constants.FEATURE_BUSINESS_ONBOARDING,
			constants.FEATURE_ADVANCED_SEO,
			isEnabled( 'automated-transfer' ) && constants.FEATURE_UPLOAD_PLUGINS,
			isEnabled( 'automated-transfer' ) && constants.FEATURE_UPLOAD_THEMES,
			constants.FEATURE_NO_BRANDING,
		] ),
	getPromotedFeatures: () => [
		constants.FEATURE_200GB_STORAGE,
		constants.FEATURE_UNLIMITED_PREMIUM_THEMES,
		constants.FEATURE_CUSTOM_DOMAIN,
		constants.FEATURE_NO_ADS,
		constants.FEATURE_ADVANCED_DESIGN,
		constants.FEATURE_VIDEO_UPLOADS,
		constants.FEATURE_BUSINESS_ONBOARDING,
	],
	getSignupFeatures: () => [
		constants.FEATURE_UPLOAD_THEMES_PLUGINS,
		constants.FEATURE_ADVANCED_SEO_TOOLS,
		constants.FEATURE_ALL_PREMIUM_FEATURES,
	],
	getBlogSignupFeatures: () => [
		constants.FEATURE_UPLOAD_THEMES_PLUGINS,
		constants.FEATURE_ADVANCED_SEO_TOOLS,
		constants.FEATURE_ALL_PREMIUM_FEATURES,
	],
	getPortfolioSignupFeatures: () => [
		constants.FEATURE_UPLOAD_THEMES_PLUGINS,
		constants.FEATURE_200GB_STORAGE,
		constants.FEATURE_ALL_PREMIUM_FEATURES,
	],
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [
		constants.FEATURE_AUDIO_UPLOADS,
		constants.FEATURE_GOOGLE_MY_BUSINESS,
		constants.FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT,
	],
	getInferiorHiddenFeatures: () => [],
} );

// DO NOT import. Use `getPlan` from `lib/plans` instead.
export const PLANS_LIST = {
	[ constants.PLAN_FREE ]: {
		group: constants.GROUP_WPCOM,
		type: constants.TYPE_FREE,
		term: constants.TERM_ANNUALLY,
		getTitle: () => i18n.translate( 'Free' ),
		getAudience: () => i18n.translate( 'Best for students' ),
		getBlogAudience: () => i18n.translate( 'Best for students' ),
		getPortfolioAudience: () => i18n.translate( 'Best for students' ),
		getStoreAudience: () => i18n.translate( 'Best for students' ),
		getProductId: () => 1,
		getStoreSlug: () => constants.PLAN_FREE,
		getPathSlug: () => 'beginner',
		getDescription: () =>
			i18n.translate(
				'Get a free website and be on your way to publishing your ' +
					'first post in less than five minutes.'
			),
		getPlanCompareFeatures: () => [
			// pay attention to ordering, shared features should align on /plan page
			constants.FEATURE_WP_SUBDOMAIN,
			constants.FEATURE_JETPACK_ESSENTIAL,
			constants.FEATURE_COMMUNITY_SUPPORT,
			constants.FEATURE_FREE_THEMES,
			constants.FEATURE_BASIC_DESIGN,
			constants.FEATURE_3GB_STORAGE,
		],
		getSignupFeatures: () => [
			constants.FEATURE_COMMUNITY_SUPPORT,
			constants.FEATURE_WP_SUBDOMAIN_SIGNUP,
			constants.FEATURE_FREE_THEMES_SIGNUP,
		],
		getBlogSignupFeatures: () => [
			constants.FEATURE_COMMUNITY_SUPPORT,
			constants.FEATURE_WP_SUBDOMAIN_SIGNUP,
			constants.FEATURE_FREE_THEMES_SIGNUP,
		],
		getPortfolioSignupFeatures: () => [
			constants.FEATURE_COMMUNITY_SUPPORT,
			constants.FEATURE_WP_SUBDOMAIN_SIGNUP,
			constants.FEATURE_FREE_THEMES_SIGNUP,
		],
		getBillingTimeFrame: () => i18n.translate( 'for life' ),
		getHiddenFeatures: () => [],
		getInferiorHiddenFeatures: () => [],
	},

	[ constants.PLAN_BLOGGER ]: {
		...getPlanBloggerDetails(),
		term: constants.TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: plan => includes( [ constants.PLAN_FREE ], plan ),
		getProductId: () => 1010,
		getStoreSlug: () => constants.PLAN_BLOGGER,
		getPathSlug: () => 'blogger',
	},

	[ constants.PLAN_BLOGGER_2_YEARS ]: {
		...getPlanBloggerDetails(),
		term: constants.TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: plan => includes( [ constants.PLAN_FREE, constants.PLAN_BLOGGER ], plan ),
		getProductId: () => 1030,
		getStoreSlug: () => constants.PLAN_BLOGGER_2_YEARS,
		getPathSlug: () => 'blogger-2-years',
	},

	[ constants.PLAN_PERSONAL ]: {
		...getPlanPersonalDetails(),
		term: constants.TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: plan =>
			includes(
				[ constants.PLAN_FREE, constants.PLAN_BLOGGER, constants.PLAN_BLOGGER_2_YEARS ],
				plan
			),
		getProductId: () => 1009,
		getStoreSlug: () => constants.PLAN_PERSONAL,
		getPathSlug: () => 'personal',
	},

	[ constants.PLAN_PERSONAL_2_YEARS ]: {
		...getPlanPersonalDetails(),
		term: constants.TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: plan =>
			includes(
				[
					constants.PLAN_FREE,
					constants.PLAN_BLOGGER,
					constants.PLAN_BLOGGER_2_YEARS,
					constants.PLAN_PERSONAL,
				],
				plan
			),
		getProductId: () => 1029,
		getStoreSlug: () => constants.PLAN_PERSONAL_2_YEARS,
		getPathSlug: () => 'personal-2-years',
	},

	[ constants.PLAN_PREMIUM ]: {
		...getPlanPremiumDetails(),
		term: constants.TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: plan =>
			includes(
				[
					constants.PLAN_FREE,
					constants.PLAN_BLOGGER,
					constants.PLAN_BLOGGER_2_YEARS,
					constants.PLAN_PERSONAL,
					constants.PLAN_PERSONAL_2_YEARS,
				],
				plan
			),
		getProductId: () => 1003,
		getStoreSlug: () => constants.PLAN_PREMIUM,
		getPathSlug: () => 'premium',
	},

	[ constants.PLAN_PREMIUM_2_YEARS ]: {
		...getPlanPremiumDetails(),
		term: constants.TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: plan =>
			includes(
				[
					constants.PLAN_FREE,
					constants.PLAN_BLOGGER,
					constants.PLAN_BLOGGER_2_YEARS,
					constants.PLAN_PERSONAL,
					constants.PLAN_PERSONAL_2_YEARS,
					constants.PLAN_PREMIUM,
				],
				plan
			),
		getProductId: () => 1023,
		getStoreSlug: () => constants.PLAN_PREMIUM_2_YEARS,
		getPathSlug: () => 'premium-2-years',
	},

	[ constants.PLAN_BUSINESS_MONTHLY ]: {
		...getPlanBusinessDetails(),
		term: constants.TERM_MONTHLY,
		getBillingTimeFrame: () => i18n.translate( 'per month, billed monthly' ),
		availableFor: plan =>
			isEnabled( 'upgrades/wpcom-monthly-plans' ) &&
			includes(
				[
					constants.PLAN_FREE,
					constants.PLAN_BLOGGER,
					constants.PLAN_BLOGGER_2_YEARS,
					constants.PLAN_PERSONAL,
					constants.PLAN_PERSONAL_2_YEARS,
					constants.PLAN_PREMIUM,
					constants.PLAN_PREMIUM_2_YEARS,
				],
				plan
			),
		getProductId: () => 1018,
		getStoreSlug: () => constants.PLAN_BUSINESS_MONTHLY,
		getPathSlug: () => 'business-monthly',
	},

	[ constants.PLAN_BUSINESS ]: {
		...getPlanBusinessDetails(),
		term: constants.TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: plan =>
			includes(
				[
					constants.PLAN_FREE,
					constants.PLAN_BLOGGER,
					constants.PLAN_BLOGGER_2_YEARS,
					constants.PLAN_PERSONAL,
					constants.PLAN_PERSONAL_2_YEARS,
					constants.PLAN_PREMIUM,
					constants.PLAN_PREMIUM_2_YEARS,
					constants.PLAN_BUSINESS_MONTHLY,
				],
				plan
			),
		getProductId: () => 1008,
		getStoreSlug: () => constants.PLAN_BUSINESS,
		getPathSlug: () => 'business',
	},

	[ constants.PLAN_BUSINESS_2_YEARS ]: {
		...getPlanBusinessDetails(),
		term: constants.TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: plan =>
			includes(
				[
					constants.PLAN_FREE,
					constants.PLAN_BLOGGER,
					constants.PLAN_BLOGGER_2_YEARS,
					constants.PLAN_PERSONAL,
					constants.PLAN_PERSONAL_2_YEARS,
					constants.PLAN_PREMIUM,
					constants.PLAN_PREMIUM_2_YEARS,
					constants.PLAN_BUSINESS,
					constants.PLAN_BUSINESS_MONTHLY,
				],
				plan
			),
		getProductId: () => 1028,
		getStoreSlug: () => constants.PLAN_BUSINESS_2_YEARS,
		getPathSlug: () => 'business-2-years',
	},

	[ constants.PLAN_ECOMMERCE ]: {
		...getPlanEcommerceDetails(),
		term: constants.TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: plan =>
			includes(
				[
					constants.PLAN_FREE,
					constants.PLAN_BLOGGER,
					constants.PLAN_BLOGGER_2_YEARS,
					constants.PLAN_PERSONAL,
					constants.PLAN_PERSONAL_2_YEARS,
					constants.PLAN_PREMIUM,
					constants.PLAN_PREMIUM_2_YEARS,
					constants.PLAN_BUSINESS,
					constants.PLAN_BUSINESS_2_YEARS,
					constants.PLAN_BUSINESS_MONTHLY,
				],
				plan
			),
		getProductId: () => 1011,
		getStoreSlug: () => constants.PLAN_ECOMMERCE,
		getPathSlug: () => 'ecommerce',
	},

	[ constants.PLAN_ECOMMERCE_2_YEARS ]: {
		...getPlanEcommerceDetails(),
		term: constants.TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: plan =>
			includes(
				[
					constants.PLAN_FREE,
					constants.PLAN_BLOGGER,
					constants.PLAN_BLOGGER_2_YEARS,
					constants.PLAN_PERSONAL,
					constants.PLAN_PERSONAL_2_YEARS,
					constants.PLAN_PREMIUM,
					constants.PLAN_PREMIUM_2_YEARS,
					constants.PLAN_BUSINESS,
					constants.PLAN_BUSINESS_2_YEARS,
					constants.PLAN_BUSINESS_MONTHLY,
					constants.PLAN_ECOMMERCE,
				],
				plan
			),
		getProductId: () => 1031,
		getStoreSlug: () => constants.PLAN_ECOMMERCE_2_YEARS,
		getPathSlug: () => 'ecommerce-2-years',
	},

	[ constants.PLAN_JETPACK_FREE ]: {
		term: constants.TERM_ANNUALLY,
		group: constants.GROUP_JETPACK,
		type: constants.TYPE_FREE,
		getTitle: () => i18n.translate( 'Free' ),
		getAudience: () => i18n.translate( 'Best for Students' ),
		getProductId: () => 2002,
		getStoreSlug: () => constants.PLAN_JETPACK_FREE,
		getTagline: feature => {
			switch ( feature ) {
				case constants.FEATURE_JETPACK_BACKUP_DAILY:
				case constants.FEATURE_JETPACK_BACKUP_DAILY_MONTHLY:
				case constants.FEATURE_JETPACK_BACKUP_REALTIME:
				case constants.FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY:
					return i18n.translate(
						'Upgrade your site to access additional features, including spam protection and priority support.'
					);
				default:
					return i18n.translate(
						'Upgrade your site to access additional features, including spam protection, backups, and priority support.'
					);
			}
		},
		getDescription: () =>
			i18n.translate(
				'The features most needed by WordPress sites' +
					' — perfectly packaged and optimized for everyone.'
			),
		getPlanCompareFeatures: () => [
			// pay attention to ordering, shared features should align on /plan page
			constants.FEATURE_STANDARD_SECURITY_TOOLS,
			constants.FEATURE_SITE_STATS,
			constants.FEATURE_TRAFFIC_TOOLS,
			constants.FEATURE_MANAGE,
		],
		getSignupFeatures: () => [
			constants.FEATURE_FREE_WORDPRESS_THEMES,
			constants.FEATURE_SITE_STATS,
			constants.FEATURE_STANDARD_SECURITY_TOOLS,
			constants.FEATURE_TRAFFIC_TOOLS,
			constants.FEATURE_BLANK,
		],
		getBillingTimeFrame: () => i18n.translate( 'for life' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'for life' ),
		getHiddenFeatures: () => [],
		getInferiorHiddenFeatures: () => [],
	},

	[ constants.PLAN_JETPACK_PREMIUM ]: {
		group: constants.GROUP_JETPACK,
		type: constants.TYPE_PREMIUM,
		term: constants.TERM_ANNUALLY,
		getTitle: () => i18n.translate( 'Premium' ),
		getAudience: () => i18n.translate( 'Best for Small Businesses' ),
		getSubtitle: () => i18n.translate( 'Protection, speed, and revenue.' ),
		getProductId: () => 2000,
		getStoreSlug: () => constants.PLAN_JETPACK_PREMIUM,
		availableFor: plan =>
			includes(
				[
					constants.PLAN_JETPACK_FREE,
					constants.PLAN_JETPACK_PERSONAL,
					constants.PLAN_JETPACK_PERSONAL_MONTHLY,
					constants.PLAN_JETPACK_PREMIUM_MONTHLY,
				],
				plan
			),
		getPathSlug: () => 'premium',
		getDescription: () =>
			i18n.translate(
				'{{strong}}Best for Small Businesses:{{/strong}}' +
					'Comprehensive, automated scanning for security vulnerabilities, ' +
					'fast video hosting, and marketing automation.',
				plansDescriptionHeadingComponent
			),
		getTagline: () =>
			i18n.translate(
				'Your site is being secured and you have access to marketing tools and priority support.'
			),
		getPlanCompareFeatures: () =>
			compact( [
				// pay attention to ordering, shared features should align on /plan page
				constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
				constants.FEATURE_BACKUP_ARCHIVE_30,
				constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
				constants.FEATURE_AUTOMATED_RESTORES,
				constants.FEATURE_SPAM_AKISMET_PLUS,
				constants.FEATURE_EASY_SITE_MIGRATION,
				constants.FEATURE_PREMIUM_SUPPORT,
				isEnabled( 'republicize' ) && constants.FEATURE_REPUBLICIZE,
				constants.FEATURE_SIMPLE_PAYMENTS,
				constants.FEATURE_WORDADS_INSTANT,
				constants.FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
				constants.FEATURE_MALWARE_SCANNING_DAILY,
				constants.FEATURE_ADVANCED_SEO,
				constants.FEATURE_GOOGLE_ANALYTICS,
			] ),
		getSignupFeatures: () =>
			compact( [
				constants.FEATURE_MALWARE_SCANNING_DAILY,
				constants.FEATURE_AUTOMATIC_SECURITY_FIXES,
				constants.FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
				constants.FEATURE_WORDADS_INSTANT,
				constants.FEATURE_ADVANCED_SEO,
				constants.FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
			] ),
		getBillingTimeFrame: () => i18n.translate( 'per year' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'per year' ),
		getHiddenFeatures: () => [
			constants.FEATURE_JETPACK_BACKUP_DAILY,
			constants.FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
			constants.FEATURE_JETPACK_SCAN_DAILY,
			constants.FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
		],
		getInferiorHiddenFeatures: () => [],
	},

	[ constants.PLAN_JETPACK_PREMIUM_MONTHLY ]: {
		group: constants.GROUP_JETPACK,
		type: constants.TYPE_PREMIUM,
		term: constants.TERM_MONTHLY,
		getTitle: () => i18n.translate( 'Premium' ),
		getAudience: () => i18n.translate( 'Best for Small Businesses' ),
		getProductId: () => 2003,
		getStoreSlug: () => constants.PLAN_JETPACK_PREMIUM_MONTHLY,
		getPathSlug: () => 'premium-monthly',
		availableFor: plan =>
			includes(
				[
					constants.PLAN_JETPACK_FREE,
					constants.PLAN_JETPACK_PERSONAL,
					constants.PLAN_JETPACK_PERSONAL_MONTHLY,
				],
				plan
			),
		getDescription: () =>
			i18n.translate(
				'{{strong}}Best for Small Businesses:{{/strong}}' +
					'Comprehensive, automated scanning for security vulnerabilities, ' +
					'fast video hosting, and marketing automation.',
				plansDescriptionHeadingComponent
			),
		getTagline: () =>
			i18n.translate(
				'Your site is being secured and you have access to marketing tools and priority support.'
			),
		getPlanCompareFeatures: () =>
			compact( [
				// pay attention to ordering, shared features should align on /plan page
				constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
				constants.FEATURE_BACKUP_ARCHIVE_30,
				constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
				constants.FEATURE_AUTOMATED_RESTORES,
				constants.FEATURE_SPAM_AKISMET_PLUS,
				constants.FEATURE_EASY_SITE_MIGRATION,
				constants.FEATURE_PREMIUM_SUPPORT,
				isEnabled( 'republicize' ) && constants.FEATURE_REPUBLICIZE,
				constants.FEATURE_SIMPLE_PAYMENTS,
				constants.FEATURE_WORDADS_INSTANT,
				constants.FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
				constants.FEATURE_MALWARE_SCANNING_DAILY,
				constants.FEATURE_ADVANCED_SEO,
				constants.FEATURE_GOOGLE_ANALYTICS,
			] ),
		getSignupFeatures: () =>
			compact( [
				constants.FEATURE_MALWARE_SCANNING_DAILY,
				constants.FEATURE_AUTOMATIC_SECURITY_FIXES,
				constants.FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
				constants.FEATURE_WORDADS_INSTANT,
				constants.FEATURE_ADVANCED_SEO,
				constants.FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
			] ),
		getBillingTimeFrame: () => i18n.translate( 'per month, billed monthly' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'per month' ),
		getHiddenFeatures: () => [
			constants.FEATURE_JETPACK_BACKUP_DAILY,
			constants.FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
			constants.FEATURE_JETPACK_SCAN_DAILY,
			constants.FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
		],
		getInferiorHiddenFeatures: () => [],
	},

	[ constants.PLAN_JETPACK_PERSONAL ]: {
		group: constants.GROUP_JETPACK,
		type: constants.TYPE_PERSONAL,
		term: constants.TERM_ANNUALLY,
		getTitle: () => i18n.translate( 'Personal' ),
		getAudience: () => i18n.translate( 'Best for Personal Use' ),
		getProductId: () => 2005,
		getStoreSlug: () => constants.PLAN_JETPACK_PERSONAL,
		availableFor: plan =>
			includes( [ constants.PLAN_JETPACK_FREE, constants.PLAN_JETPACK_PERSONAL_MONTHLY ], plan ),
		getPathSlug: () => 'jetpack-personal',
		getDescription: () =>
			i18n.translate(
				'{{strong}}Best for Personal Use:{{/strong}}' +
					'Security essentials for your WordPress site, including ' +
					'automated backups and priority support.',
				plansDescriptionHeadingComponent
			),
		getTagline: () =>
			i18n.translate(
				'Your data is being securely backed up and you have access to priority support.'
			),
		getPlanCompareFeatures: () => [
			// pay attention to ordering, shared features should align on /plan page
			constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			constants.FEATURE_BACKUP_ARCHIVE_30,
			constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
			constants.FEATURE_AUTOMATED_RESTORES,
			constants.FEATURE_SPAM_AKISMET_PLUS,
			constants.FEATURE_EASY_SITE_MIGRATION,
			constants.FEATURE_PREMIUM_SUPPORT,
		],
		getSignupFeatures: () => [
			constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			constants.FEATURE_SPAM_AKISMET_PLUS,
			constants.FEATURE_ACTIVITY_LOG,
			constants.FEATURE_PREMIUM_SUPPORT,
			constants.FEATURE_ALL_FREE_FEATURES_JETPACK,
		],
		getBillingTimeFrame: () => i18n.translate( 'per year' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'per year' ),
		getHiddenFeatures: () => [
			constants.FEATURE_JETPACK_BACKUP_DAILY,
			constants.FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		],
		getInferiorHiddenFeatures: () => [],
	},

	[ constants.PLAN_JETPACK_PERSONAL_MONTHLY ]: {
		group: constants.GROUP_JETPACK,
		type: constants.TYPE_PERSONAL,
		term: constants.TERM_MONTHLY,
		getTitle: () => i18n.translate( 'Personal' ),
		getAudience: () => i18n.translate( 'Best for Personal Use' ),
		getStoreSlug: () => constants.PLAN_JETPACK_PERSONAL_MONTHLY,
		getProductId: () => 2006,
		getPathSlug: () => 'jetpack-personal-monthly',
		availableFor: plan => includes( [ constants.PLAN_JETPACK_FREE ], plan ),
		getDescription: () =>
			i18n.translate(
				'{{strong}}Best for Personal Use:{{/strong}}' +
					'Security essentials for your WordPress site, including ' +
					'automated backups and priority support.',
				plansDescriptionHeadingComponent
			),
		getTagline: () =>
			i18n.translate(
				'Your data is being securely backed up and you have access to priority support.'
			),
		getPlanCompareFeatures: () => [
			// pay attention to ordering, shared features should align on /plan page
			constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			constants.FEATURE_BACKUP_ARCHIVE_30,
			constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
			constants.FEATURE_AUTOMATED_RESTORES,
			constants.FEATURE_SPAM_AKISMET_PLUS,
			constants.FEATURE_EASY_SITE_MIGRATION,
			constants.FEATURE_PREMIUM_SUPPORT,
		],
		getSignupFeatures: () => [
			constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			constants.FEATURE_SPAM_AKISMET_PLUS,
			constants.FEATURE_ACTIVITY_LOG,
			constants.FEATURE_PREMIUM_SUPPORT,
			constants.FEATURE_ALL_FREE_FEATURES_JETPACK,
		],
		getBillingTimeFrame: () => i18n.translate( 'per month, billed monthly' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'per month' ),
		getHiddenFeatures: () => [
			constants.FEATURE_JETPACK_BACKUP_DAILY,
			constants.FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		],
		getInferiorHiddenFeatures: () => [],
	},

	[ constants.PLAN_JETPACK_BUSINESS ]: {
		group: constants.GROUP_JETPACK,
		type: constants.TYPE_BUSINESS,
		term: constants.TERM_ANNUALLY,
		getTitle: () => i18n.translate( 'Professional' ),
		getAudience: () => i18n.translate( 'Best for Organizations' ),
		getStoreSlug: () => constants.PLAN_JETPACK_BUSINESS,
		getProductId: () => 2001,
		availableFor: plan =>
			includes(
				[
					constants.PLAN_JETPACK_BUSINESS_MONTHLY,
					constants.PLAN_JETPACK_FREE,
					constants.PLAN_JETPACK_PREMIUM,
					constants.PLAN_JETPACK_PREMIUM_MONTHLY,
					constants.PLAN_JETPACK_PERSONAL,
					constants.PLAN_JETPACK_PERSONAL_MONTHLY,
				],
				plan
			),
		getPathSlug: () => 'professional',
		getDescription: () =>
			i18n.translate(
				'{{strong}}Best for Organizations:{{/strong}}' +
					'The most powerful WordPress sites: real-time backups, ' +
					'enhanced search, and unlimited premium themes.',
				plansDescriptionHeadingComponent
			),
		getTagline: () =>
			i18n.translate( 'You have the full suite of security and performance tools.' ),
		getPlanCompareFeatures: () =>
			compact( [
				// pay attention to ordering, shared features should align on /plan page
				constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
				constants.FEATURE_BACKUP_ARCHIVE_UNLIMITED,
				constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
				constants.FEATURE_AUTOMATED_RESTORES,
				constants.FEATURE_SPAM_AKISMET_PLUS,
				constants.FEATURE_EASY_SITE_MIGRATION,
				constants.FEATURE_PREMIUM_SUPPORT,
				constants.FEATURE_SEARCH,
				isEnabled( 'republicize' ) && constants.FEATURE_REPUBLICIZE,
				constants.FEATURE_SIMPLE_PAYMENTS,
				constants.FEATURE_WORDADS_INSTANT,
				constants.FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
				constants.FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
				constants.FEATURE_ONE_CLICK_THREAT_RESOLUTION,
				constants.FEATURE_ADVANCED_SEO,
				constants.FEATURE_GOOGLE_ANALYTICS,
				constants.FEATURE_UNLIMITED_PREMIUM_THEMES,
			] ),
		getSignupFeatures: () =>
			compact( [
				constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
				constants.FEATURE_SEARCH,
				constants.FEATURE_UNLIMITED_PREMIUM_THEMES,
				constants.FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
			] ),
		getBillingTimeFrame: () => i18n.translate( 'per year' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'per year' ),
		getHiddenFeatures: () => [
			constants.FEATURE_JETPACK_BACKUP_REALTIME,
			constants.FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
			constants.FEATURE_JETPACK_SCAN_DAILY,
			constants.FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
		],
		getInferiorHiddenFeatures: () => [
			constants.FEATURE_JETPACK_BACKUP_DAILY,
			constants.FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		],
	},

	[ constants.PLAN_JETPACK_BUSINESS_MONTHLY ]: {
		group: constants.GROUP_JETPACK,
		type: constants.TYPE_BUSINESS,
		term: constants.TERM_MONTHLY,
		getTitle: () => i18n.translate( 'Professional' ),
		getAudience: () => i18n.translate( 'Best for Organizations' ),
		getSubtitle: () => i18n.translate( 'Ultimate security and traffic tools.' ),
		getProductId: () => 2004,
		getStoreSlug: () => constants.PLAN_JETPACK_BUSINESS_MONTHLY,
		getPathSlug: () => 'professional-monthly',
		availableFor: plan =>
			includes(
				[
					constants.PLAN_JETPACK_FREE,
					constants.PLAN_JETPACK_PREMIUM,
					constants.PLAN_JETPACK_PREMIUM_MONTHLY,
					constants.PLAN_JETPACK_PERSONAL,
					constants.PLAN_JETPACK_PERSONAL_MONTHLY,
				],
				plan
			),
		getDescription: () =>
			i18n.translate(
				'{{strong}}Best for Organizations:{{/strong}}' +
					'The most powerful WordPress sites: real-time backups, ' +
					'enhanced search, and unlimited premium themes.',
				plansDescriptionHeadingComponent
			),
		getTagline: () =>
			i18n.translate( 'You have the full suite of security and performance tools.' ),
		getPlanCompareFeatures: () =>
			compact( [
				// pay attention to ordering, shared features should align on /plan page
				constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
				constants.FEATURE_BACKUP_ARCHIVE_UNLIMITED,
				constants.FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
				constants.FEATURE_AUTOMATED_RESTORES,
				constants.FEATURE_SPAM_AKISMET_PLUS,
				constants.FEATURE_EASY_SITE_MIGRATION,
				constants.FEATURE_PREMIUM_SUPPORT,
				isEnabled( 'republicize' ) && constants.FEATURE_REPUBLICIZE,
				constants.FEATURE_SIMPLE_PAYMENTS,
				constants.FEATURE_WORDADS_INSTANT,
				constants.FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
				constants.FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
				constants.FEATURE_ONE_CLICK_THREAT_RESOLUTION,
				constants.FEATURE_ADVANCED_SEO,
				constants.FEATURE_GOOGLE_ANALYTICS,
				constants.FEATURE_UNLIMITED_PREMIUM_THEMES,
			] ),
		getSignupFeatures: () =>
			compact( [
				constants.FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
				constants.FEATURE_SEARCH,
				constants.FEATURE_UNLIMITED_PREMIUM_THEMES,
				constants.FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
			] ),
		getBillingTimeFrame: () => i18n.translate( 'per month, billed monthly' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'per month' ),
		getHiddenFeatures: () => [
			constants.FEATURE_JETPACK_BACKUP_REALTIME,
			constants.FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
		],
		getInferiorHiddenFeatures: () => [
			constants.FEATURE_JETPACK_BACKUP_DAILY,
			constants.FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
			constants.FEATURE_JETPACK_SCAN_DAILY,
			constants.FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
		],
	},
};

export const PLANS_CONSTANTS_LIST = Object.keys( PLANS_LIST );

export const getPlanObject = planName => {
	const plan = PLANS_LIST[ planName ];
	const objectPlan = {};
	Object.keys( plan ).forEach( key => {
		const objectKey =
			key
				.substr( 3 )
				.charAt( 0 )
				.toLowerCase() + key.slice( 4 );
		objectPlan[ objectKey ] = plan[ key ]();
	} );

	return objectPlan;
};
