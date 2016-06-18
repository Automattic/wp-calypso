/** @ssr-ready **/

import React from 'react';

import i18n from 'i18n-calypso';

// plans constants
export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_PREMIUM = 'value_bundle';
export const PLAN_PERSONAL = 'personal-bundle';
export const PLAN_FREE = 'free_plan';
export const PLAN_JETPACK_FREE = 'jetpack_free';
export const PLAN_JETPACK_PREMIUM = 'jetpack_premium';
export const PLAN_JETPACK_BUSINESS = 'jetpack_business';

// features constants
export const FEATURE_CUSTOM_DESIGN = 'custom-design';
export const FEATURE_CUSTOM_DOMAIN = 'custom-domain';
export const FEATURE_GOOGLE_ANALYTICS = 'google-analytics';
export const FEATURE_GOOGLE_AD_CREDITS = 'google-ad-credits';
export const FEATURE_LIVE_CHAT_SUPPORT = 'live-chat-support';
export const FEATURE_NO_ADS = 'no-adverts';
export const FEATURE_UNLIMITED_PREMIUM_THEMES = 'premium-themes';
export const FEATURE_UNLIMITED_STORAGE = 'unlimited-storage';
export const FEATURE_VIDEO_UPLOADS = 'video-upload';
export const WORDADS_INSTANT = 'wordads-instant';

export const plansList = {
	[ PLAN_FREE ]: {
		getTitle: () => i18n.translate( 'Free' ),
		getPriceTitle: () => i18n.translate( 'Free for life' ),
		getProductId: () => 1,
		getDescription: () => i18n.translate( 'Get a free blog and be on your way to publishing your first post in less than five minutes.' )
	},

	[ PLAN_PREMIUM ]: {
		getTitle: () => i18n.translate( 'Premium' ),
		getPriceTitle: () => i18n.translate( '$99 per year' ),
		getProductId: () => 1003,
		getDescription: () => i18n.translate( 'Your own domain name, powerful customization options, lots of space for audio and video, and $100 advertising credit.' )
	},

	[ PLAN_BUSINESS ]: {
		getTitle: () => i18n.translate( 'Business' ),
		getPriceTitle: () => i18n.translate( '$299 per year' ),
		getProductId: () => 1008,
		getDescription: () => i18n.translate( 'Everything included with Premium, as well as live chat support, unlimited access to premium themes, and Google Analytics.' ),
		getDescriptionWithWordAdsCredit: () => i18n.translate( 'Everything included with Premium, as well as live chat support, unlimited access to premium themes, Google Analytics, and $200 advertising credit.' ),
	},

	[ PLAN_JETPACK_FREE ]: {},
	[ PLAN_JETPACK_BUSINESS ]: {}
};

const allPaidPlans = [
	PLAN_PREMIUM,
	PLAN_BUSINESS
];

export const featuresList = {
	[ FEATURE_GOOGLE_ANALYTICS ]: {
		getTitle: () => i18n.translate( 'Google Analytics' ),
		plans: [ PLAN_BUSINESS ]
	},

	[ FEATURE_UNLIMITED_STORAGE ]: {
		getTitle: () => i18n.translate( 'Unlimited Storage' ),
		plans: [ PLAN_BUSINESS ]
	},

	[ FEATURE_CUSTOM_DOMAIN ]: {
		getTitle: () => i18n.translate( 'Custom Domain' ),
		plans: allPaidPlans
	},

	[ FEATURE_UNLIMITED_PREMIUM_THEMES ]: {
		getTitle: () => i18n.translate( 'Unlimited Premium Themes' ),
		plans: [ PLAN_BUSINESS ]
	},

	[ FEATURE_VIDEO_UPLOADS ]: {
		getTitle: () => i18n.translate( 'VideoPress' ),
		plans: allPaidPlans
	},

	[ FEATURE_CUSTOM_DESIGN ]: {
		getTitle: () => i18n.translate( 'Custom Design' ),
		plans: allPaidPlans
	},

	[ FEATURE_NO_ADS ]: {
		getTitle: () => i18n.translate( 'No Ads' ),
		plans: allPaidPlans
	},

	[ FEATURE_LIVE_CHAT_SUPPORT ]: {
		getTitle: () => i18n.translate( 'Live Chat Support' ),
		plans: [ PLAN_BUSINESS ]
	},

	[ FEATURE_GOOGLE_AD_CREDITS ]: {
		getTitle: () => i18n.translate( 'Advertising Credit' ),
		getDescription: () => i18n.translate( '$100 Google AdWords credit after spending the first $25. Offer valid in US and Canada.' ),
		getDescriptionWithWordAdsCredit: () => i18n.translate( '$100 Google AdWords credit after spending the first $25. ' +
			'Offer valid in US and Canada. {{hr/}}Business also includes $100 of advertising from WordAds on WordPress.com.', {
			components: {
				hr: <hr className="plans-compare__info-hr"/>
			}
		} ),
		plans: allPaidPlans
	},

	[ WORDADS_INSTANT ]: {
		getTitle: () => i18n.translate( 'Monetize Your Site' ),
		getDescription: () => i18n.translate( 'Add advertising to your site through our WordAds program and get paid.' ),
		plans: allPaidPlans
	}
};

export const getPlanObject = planName => {
	const plan = plansList[ planName ];
	let objectPlan = {};
	Object.keys( plan ).forEach( key => {
		let objectKey = key.substr( 3 ).charAt( 0 ).toLowerCase() + key.slice( 4 );
		objectPlan[ objectKey ] = plan[ key ]();
	} );

	return objectPlan;
};
