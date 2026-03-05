import type { HelpCenterFeatureConfig, HelpCenterProduct } from './types';

/** WordPress.com default: all features enabled. */
const wpcomPreset: HelpCenterFeatureConfig = {
	header: {
		ellipsisMenu: true,
	},
	chat: {
		enabled: true,
		filterByBotSlug: false,
		flowName: null,
		skipSupportStatus: false,
	},
	home: {
		recentConversations: true,
	},
	moreResources: {
		visible: true,
		supportHistory: true,
		courses: true,
		productUpdates: true,
		feedback: true,
		supportGuidesUrl: null,
	},
	contactForm: {
		variant: 'standard',
	},
};

/** A4A: chat disabled, no more resources, A4A contact form. */
const a4aPreset: HelpCenterFeatureConfig = {
	header: {
		ellipsisMenu: false,
	},
	chat: {
		enabled: false,
		filterByBotSlug: false,
		flowName: null,
		skipSupportStatus: false,
	},
	home: {
		recentConversations: false,
	},
	moreResources: {
		visible: false,
		supportHistory: false,
		courses: true,
		productUpdates: true,
		feedback: false,
		supportGuidesUrl: null,
	},
	contactForm: {
		variant: 'a4a',
	},
};

/** Commerce Garden: chat enabled with filtered history, no dotcom-specific links. */
const commerceGardenPreset: HelpCenterFeatureConfig = {
	header: {
		ellipsisMenu: true,
	},
	chat: {
		enabled: true,
		filterByBotSlug: true,
		flowName: 'messaging_flow_commerce_in_a_box',
		skipSupportStatus: true,
	},
	home: {
		recentConversations: true,
	},
	moreResources: {
		visible: true,
		supportHistory: true,
		courses: false,
		productUpdates: false,
		feedback: true,
		supportGuidesUrl: 'https://ciabattasupportguides.wpcomstaging.com/',
	},
	contactForm: {
		variant: 'standard',
	},
};

export const PRODUCT_PRESETS: Record< HelpCenterProduct, HelpCenterFeatureConfig > = {
	wpcom: wpcomPreset,
	a4a: a4aPreset,
	'commerce-garden': commerceGardenPreset,
};
