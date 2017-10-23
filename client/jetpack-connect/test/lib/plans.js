/**
 * @format
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import { identity, noop } from 'lodash';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { PlansTestComponent as Plans } from '../../plans';
import {
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PREMIUM,
} from 'lib/plans/constants';

/**
 * Test fixtures
 */
export const USER_ID = 98765;
export const SITE_ID = 1234567;
export const SITE_SLUG = 'an.example.site';
export const BASE_PLANS_PATH = '/jetpack/connect/plans';

export const SITE_PLAN_FREE = deepFreeze( {
	product_id: 2002,
	product_slug: PLAN_JETPACK_FREE,
	product_name_short: 'Free',
	free_trial: false,
	expired: false,
	user_is_owner: false,
	is_free: true,
} );

export const SITE_PLAN_PERSONAL = deepFreeze( {
	product_id: 2005,
	product_slug: PLAN_JETPACK_PERSONAL,
	product_name_short: 'Premium',
	free_trial: false,
	expired: false,
	user_is_owner: false,
	is_free: true,
} );

export const SITE_PLAN_PREMIUM = deepFreeze( {
	product_id: 2000,
	product_slug: PLAN_JETPACK_PREMIUM,
	product_name_short: 'Personal',
	free_trial: false,
	expired: false,
	user_is_owner: false,
	is_free: true,
} );

export const SITE_PLAN_PRO = deepFreeze( {
	product_id: 2001,
	product_slug: PLAN_JETPACK_BUSINESS,
	product_name_short: 'Professional',
	free_trial: false,
	expired: false,
	user_is_owner: false,
	is_free: true,
} );

export const CONTEXT = deepFreeze( {
	canonicalPath: `/jetpack/connect/plans/${ SITE_SLUG }`,
	path: `/jetpack/connect/plans/${ SITE_SLUG }`,
	title: 'WordPress.com',
	state: { path: `/jetpack/connect/plans/${ SITE_SLUG }` },
	querystring: '',
	pathname: `/jetpack/connect/plans/${ SITE_SLUG }`,
	params: {
		0: `/jetpack/connect/plans/${ SITE_SLUG }`,
		site: SITE_SLUG,
	},
	hash: {},
	init: true,
	store: {},
	query: {},
	prevPath: false,
} );

export const TRANSACTION = deepFreeze( {
	errors: {},
	newCardFormFields: {},
	step: { name: 'before-submit' },
	domainDetails: null,
} );

export const SELECTED_SITE = deepFreeze( {
	ID: SITE_ID,
	name: 'Test Site',
	URL: `http://${ SITE_SLUG }`,
	jetpack: true,
	visible: true,
	is_private: false,
	is_vip: false,
	options: {
		gmt_offset: 0,
		videopress_enabled: false,
		upgraded_filetypes_enabled: true,
		admin_url: `http://${ SITE_SLUG }/wp-admin/`,
		is_mapped_domain: true,
		is_redirect: false,
		unmapped_url: `http://${ SITE_SLUG }`,
		permalink_structure: '/%year%/%monthnum%/%day%/%postname%/',
		default_post_format: 'standard',
		allowed_file_types: [
			'jpg',
			'jpeg',
			'png',
			'gif',
			'pdf',
			'doc',
			'ppt',
			'odt',
			'pptx',
			'docx',
			'pps',
			'ppsx',
			'xls',
			'xlsx',
			'key',
		],
		show_on_front: 'posts',
		default_likes_enabled: true,
		default_sharing_status: false,
		software_version: '4.8.2',
		created_at: '2017-10-19T11:20:01+00:00',
		wordads: false,
		publicize_permanently_disabled: false,
		frame_nonce: 'foobarbaz',
		advanced_seo_front_page_description: '',
		advanced_seo_title_formats: [],
		verification_services_codes: null,
		podcasting_archive: null,
		is_domain_only: false,
		is_automated_transfer: false,
		jetpack_version: '5.4',
		main_network_site: `http://${ SITE_SLUG }`,
		active_modules: [
			'after-the-deadline',
			'contact-form',
			'custom-content-types',
			'custom-css',
			'enhanced-distribution',
			'gravatar-hovercards',
			'json-api',
			'latex',
			'manage',
			'notes',
			'post-by-email',
			'protect',
			'publicize',
			'sharedaddy',
			'shortcodes',
			'shortlinks',
			'sitemaps',
			'stats',
			'subscriptions',
			'verification-tools',
			'widget-visibility',
			'widgets',
		],
		max_upload_size: false,
		is_multi_network: false,
		is_multi_site: false,
		file_mod_disabled: false,
	},
	is_multisite: false,
	capabilities: {
		edit_pages: true,
		edit_posts: true,
		edit_others_posts: true,
		edit_others_pages: true,
		delete_posts: true,
		delete_others_posts: true,
		edit_theme_options: true,
		edit_users: true,
		list_users: true,
		manage_categories: true,
		manage_options: true,
		moderate_comments: true,
		activate_wordads: true,
		promote_users: true,
		publish_posts: true,
		upload_files: true,
		delete_users: false,
		remove_users: true,
		view_stats: true,
	},
	plan: SITE_PLAN_FREE,
	single_user_site: false,
	domain: SITE_SLUG,
	hasConflict: false,
	is_customizable: true,
	is_previewable: false,
	slug: SITE_SLUG,
	title: 'Test Site',
	hasMinimumJetpackVersion: true,
	canAutoupdateFiles: true,
	canUpdateFiles: true,
	canManage: true,
	isMainNetworkSite: true,
	isSecondaryNetworkSite: false,
	isSiteUpgradeable: true,
} );

export const CART = deepFreeze( {
	blog_id: SITE_ID,
	cart_key: '' + SITE_ID,
	coupon: '',
	is_coupon_applied: false,
	has_bundle_credit: false,
	next_domain_is_free: false,
	products: [],
	total_cost: 0,
	currency: 'EUR',
	total_cost_display: '€0',
	temporary: false,
	credits: 0,
	allowed_payment_methods: [
		'WPCOM_Billing_PayPal_Express',
		'WPCOM_Billing_MoneyPress_Paygate',
		'WPCOM_Billing_Stripe_Source_Ideal',
	],
	create_new_blog: false,
	messages: { errors: [], success: [] },
	client_metadata: { last_server_response_date: '2017-10-19T11:45:21.862Z' },
	hasLoadedFromServer: true,
	hasPendingServerUpdates: false,
} );

export const SITE_PLANS = deepFreeze( {
	data: [
		{
			autoRenew: false,
			autoRenewDateMoment: null,
			canStartTrial: false,
			currentPlan: false,
			currencyCode: 'EUR',
			discountReason: null,
			expiryMoment: null,
			formattedDiscount: '€0',
			formattedOriginalPrice: '€0',
			formattedPrice: '€59.88',
			freeTrial: false,
			hasDomainCredit: false,
			id: null,
			interval: 365,
			isDomainUpgrade: false,
			productName: 'Premium',
			productSlug: 'jetpack_premium',
			rawDiscount: 0,
			rawPrice: 59.88,
			subscribedDayMoment: '2017-10-18T22:00:00.000Z',
			userFacingExpiryMoment: null,
			userIsOwner: false,
		},
		{
			autoRenew: false,
			autoRenewDateMoment: null,
			canStartTrial: false,
			currentPlan: false,
			currencyCode: 'EUR',
			discountReason: null,
			expiryMoment: null,
			formattedDiscount: '€0',
			formattedOriginalPrice: '€0',
			formattedPrice: '€155.88',
			freeTrial: false,
			hasDomainCredit: false,
			id: null,
			interval: 365,
			isDomainUpgrade: false,
			productName: 'Professional',
			productSlug: 'jetpack_business',
			rawDiscount: 0,
			rawPrice: 155.88,
			subscribedDayMoment: '2017-10-18T22:00:00.000Z',
			userFacingExpiryMoment: null,
			userIsOwner: false,
		},
		{
			autoRenew: false,
			autoRenewDateMoment: null,
			canStartTrial: false,
			currentPlan: false,
			currencyCode: 'EUR',
			discountReason: null,
			expiryMoment: null,
			formattedDiscount: '€0',
			formattedOriginalPrice: '€0',
			formattedPrice: '€0',
			freeTrial: false,
			hasDomainCredit: false,
			id: 0,
			interval: -1,
			isDomainUpgrade: false,
			productName: 'Free',
			productSlug: 'jetpack_free',
			rawDiscount: 0,
			rawPrice: 0,
			subscribedDayMoment: '2017-10-18T22:00:00.000Z',
			userFacingExpiryMoment: null,
			userIsOwner: false,
		},
		{
			autoRenew: false,
			autoRenewDateMoment: null,
			canStartTrial: false,
			currentPlan: false,
			currencyCode: 'EUR',
			discountReason: null,
			expiryMoment: null,
			formattedDiscount: '€0',
			formattedOriginalPrice: '€0',
			formattedPrice: '€6.99',
			freeTrial: false,
			hasDomainCredit: false,
			id: null,
			interval: 31,
			isDomainUpgrade: false,
			productName: 'Premium',
			productSlug: 'jetpack_premium_monthly',
			rawDiscount: 0,
			rawPrice: 6.99,
			subscribedDayMoment: '2017-10-18T22:00:00.000Z',
			userFacingExpiryMoment: null,
			userIsOwner: false,
		},
		{
			autoRenew: false,
			autoRenewDateMoment: null,
			canStartTrial: false,
			currentPlan: false,
			currencyCode: 'EUR',
			discountReason: null,
			expiryMoment: null,
			formattedDiscount: '€0',
			formattedOriginalPrice: '€0',
			formattedPrice: '€19.99',
			freeTrial: false,
			hasDomainCredit: false,
			id: null,
			interval: 31,
			isDomainUpgrade: false,
			productName: 'Professional',
			productSlug: 'jetpack_business_monthly',
			rawDiscount: 0,
			rawPrice: 19.99,
			subscribedDayMoment: '2017-10-18T22:00:00.000Z',
			userFacingExpiryMoment: null,
			userIsOwner: false,
		},
		{
			autoRenew: false,
			autoRenewDateMoment: null,
			canStartTrial: false,
			currentPlan: false,
			currencyCode: 'EUR',
			discountReason: null,
			expiryMoment: null,
			formattedDiscount: '€0',
			formattedOriginalPrice: '€0',
			formattedPrice: '€35.88',
			freeTrial: false,
			hasDomainCredit: false,
			id: null,
			interval: 365,
			isDomainUpgrade: false,
			productName: 'Personal',
			productSlug: 'jetpack_personal',
			rawDiscount: 0,
			rawPrice: 35.88,
			subscribedDayMoment: '2017-10-18T22:00:00.000Z',
			userFacingExpiryMoment: null,
			userIsOwner: false,
		},
		{
			autoRenew: false,
			autoRenewDateMoment: null,
			canStartTrial: false,
			currentPlan: false,
			currencyCode: 'EUR',
			discountReason: null,
			expiryMoment: null,
			formattedDiscount: '€0',
			formattedOriginalPrice: '€0',
			formattedPrice: '€3.50',
			freeTrial: false,
			hasDomainCredit: false,
			id: null,
			interval: 31,
			isDomainUpgrade: false,
			productName: 'Personal',
			productSlug: 'jetpack_personal_monthly',
			rawDiscount: 0,
			rawPrice: 3.5,
			subscribedDayMoment: '2017-10-18T22:00:00.000Z',
			userFacingExpiryMoment: null,
			userIsOwner: false,
		},
	],
	error: null,
	hasLoadedFromServer: true,
	isRequesting: false,
} );

export const PLANS_SLUG = '*';

export function getSitePlans( currentPlan = PLAN_JETPACK_FREE ) {
	return {
		...SITE_PLANS,
		data: SITE_PLANS.data.map(
			plan => ( plan.productSlug === currentPlan ? { ...plan, currentPlan: true } : plan )
		),
	};
}

export default function PlansWrapper( props ) {
	return (
		<Plans
			basePlansPath={ BASE_PLANS_PATH }
			calypsoStartedConnection={ false }
			canPurchasePlans={ true }
			cart={ CART }
			completeFlow={ noop }
			context={ CONTEXT }
			flowType={ false }
			getPlanBySlug={ noop }
			goBackToWpAdmin={ noop }
			isAutomatedTransfer={ false }
			isRequestingPlans={ false }
			isRtlLayout={ false }
			jetpackConnectAuthorize={ {} }
			recordTracksEvent={ noop }
			redirectingToWpAdmin={ false }
			selectedSite={ SELECTED_SITE }
			selectedSiteSlug={ SITE_SLUG }
			selectPlanInAdvance={ noop }
			sitePlans={ getSitePlans() }
			siteSlug={ PLANS_SLUG }
			transaction={ TRANSACTION }
			translate={ identity }
			userId={ USER_ID }
			{ ...props }
		/>
	);
}
