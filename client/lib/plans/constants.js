import i18n from 'lib/mixins/i18n';

// plans constants
export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_PREMIUM = 'value_bundle';
export const PLAN_FREE = 'free_plan';
export const PLAN_JETPACK_FREE = 'jetpack_free';
export const PLAN_JETPACK_PREMIUM = 'jetpack_premium';
export const PLAN_JETPACK_BUSINESS = 'jetpack_business';

// features constants
export const FEATURE_CUSTOM_DESIGN = 'custom-design';
export const FEATURE_CUSTOM_DOMAIN = 'custom-domain';
export const FEATURE_GOOGLE_ANALYTICS = 'google-analytics';
export const FEATURE_LIVE_CHAT_SUPPORT = 'live-chat-support';
export const FEATURE_NO_ADS = 'no-ads';
export const FEATURE_UNLIMITED_PREMIUM_THEMES = 'unlimited-premium-themes';
export const FEATURE_UNLIMITED_STORAGE = 'unlimited-storage';
export const FEATURE_VIDEO_UPLOADS = 'video-upload';

export const plansList = {
	[ PLAN_FREE ]: {
		getTitle: () => i18n.translate( 'Free' ),
		getPriceTitle: () => i18n.translate( 'Free for life' )
	},

	[ PLAN_PREMIUM ]: {
		getTitle: () => i18n.translate( 'Premium' ),
		getPriceTitle: () => i18n.translate( '$99 per year' )
	},

	[ PLAN_BUSINESS ]: {
		getTitle: () => i18n.translate( 'Business' ),
		getPriceTitle: () => i18n.translate( '$299 per year' )
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
	}
};
