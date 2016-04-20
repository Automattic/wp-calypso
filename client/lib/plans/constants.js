import i18n from 'lib/mixins/i18n';

export const plansList = {
	'free_plan': {
		getTitle: () => i18n.translate( 'Free' ),
		getPriceTitle: () => i18n.translate( 'Free for life' ),
		planCheckoutSlug: ''
	},
	'value_bundle': {
		getTitle: () => i18n.translate( 'Premium' ),
		getPriceTitle: () => i18n.translate( '$99 per year' ),
		planCheckoutSlug: 'premium'
	},
	'business-bundle': {
		getTitle: () => i18n.translate( 'Business' ),
		getPriceTitle: () => i18n.translate( '$299 per year' ),
		planCheckoutSlug: 'business'
	},
	'jetpack_free': {},
	'jetpack_business': {}
};

const allPaidPlans = [
	'value_bundle',
	'business-bundle'
];

export const featuresList = {
	'google-analytics': {
		getTitle: () => i18n.translate( 'Google Analytics' ),
		plans: [ 'business-bundle' ]
	},
	'unlimited-storage': {
		getTitle: () => i18n.translate( 'Unlimited Storage' ),
		plans: [ 'business-bundle' ]
	},
	'more-storage': {
		getTitle: () => i18n.translate( '13GB Storage' ),
		plans: allPaidPlans
	},
	'custom-domain': {
		getTitle: () => i18n.translate( 'Custom Domain' ),
		plans: allPaidPlans
	},
	'unlimited-premium-themes': {
		getTitle: () => i18n.translate( 'Unlimited Premium Themes' ),
		plans: [ 'business-bundle' ]
	},
	'video-upload': {
		getTitle: () => i18n.translate( 'VideoPress' ),
		plans: allPaidPlans
	},
	'custom-design': {
		getTitle: () => i18n.translate( 'Custom Design' ),
		plans: allPaidPlans
	},
	'no-ads': {
		getTitle: () => i18n.translate( 'No Ads' ),
		plans: allPaidPlans
	},
	'live-chat-support': {
		getTitle: () => i18n.translate( 'Live Chat Support' ),
		plans: [ 'business-bundle' ]
	}
};
