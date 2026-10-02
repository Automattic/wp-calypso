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
		hasPremiumSupport: false,
		skipSupportStatus: false,
		zendeskIntegrationKey: null,
		zendeskConversationTags: [],
	},
	home: {
		recentConversations: true,
	},
	contextualCta: {
		enabled: true,
	},
	moreResources: {
		visible: true,
		supportHistory: true,
		courses: true,
		productUpdates: true,
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
		hasPremiumSupport: false,
		skipSupportStatus: false,
		zendeskIntegrationKey: null,
		zendeskConversationTags: [],
	},
	home: {
		recentConversations: false,
	},
	contextualCta: {
		enabled: false,
	},
	moreResources: {
		visible: false,
		supportHistory: false,
		courses: true,
		productUpdates: true,
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
		hasPremiumSupport: true,
		skipSupportStatus: true,
		zendeskIntegrationKey: null,
		zendeskConversationTags: [],
	},
	home: {
		recentConversations: true,
	},
	contextualCta: {
		enabled: false,
	},
	moreResources: {
		visible: true,
		supportHistory: true,
		courses: false,
		productUpdates: false,
		supportGuidesUrl: 'https://ciabattasupportguides.wpcomstaging.com/',
	},
	contactForm: {
		variant: 'standard',
	},
};

/** WooCommerce.com: chat enabled with filtered history, Woo docs instead of dotcom-specific links. */
const wooPreset: HelpCenterFeatureConfig = {
	header: {
		ellipsisMenu: true,
	},
	chat: {
		enabled: true,
		filterByBotSlug: true,
		flowName: null,
		// Testing: open to all in sandbox. Production will gate on WordPress.com connection.
		hasPremiumSupport: true,
		skipSupportStatus: true,
		zendeskIntegrationKey: 'woo',
		// Placeholder until the Zendesk admins confirm the Help Center routing tag.
		zendeskConversationTags: [ 'woo_support_flow_help_center' ],
	},
	home: {
		recentConversations: true,
	},
	contextualCta: {
		enabled: false,
	},
	moreResources: {
		visible: true,
		supportHistory: true,
		courses: false,
		productUpdates: false,
		supportGuidesUrl: 'https://woocommerce.com/docs/',
	},
	contactForm: {
		variant: 'standard',
	},
};

export const PRODUCT_PRESETS: Record< HelpCenterProduct, HelpCenterFeatureConfig > = {
	wpcom: wpcomPreset,
	a4a: a4aPreset,
	'commerce-garden': commerceGardenPreset,
	woo: wooPreset,
};
