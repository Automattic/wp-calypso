import type { SMOOCH_INTEGRATION_ID_CUSTOM } from '@automattic/zendesk-client';

/**
 * Nested feature configuration for the help center.
 * Each key maps to a UI area; each value controls visibility or behavior.
 */
export type HelpCenterFeatureConfig = {
	header: {
		/** Show the ellipsis menu (New chat, Support history, Sound notifications). */
		ellipsisMenu: boolean;
	};
	chat: {
		/** Allow access to the live chat/Odie assistant. */
		enabled: boolean;
		/** Filter chat history to only show conversations matching the current bot slug. */
		filterByBotSlug: boolean;
		/** Override the flow name for the Odie provider. */
		flowName: string | null;
		/** Treat the user as having premium support (bypass eligibility checks). */
		hasPremiumSupport: boolean;
		/** Skip fetching support status. */
		skipSupportStatus: boolean;
		/** Key into `SMOOCH_INTEGRATION_ID_CUSTOM` selecting a dedicated Zendesk messaging integration. Null uses the default. */
		zendeskIntegrationKey: keyof typeof SMOOCH_INTEGRATION_ID_CUSTOM | null;
		/** Tags written on the Zendesk conversation at escalation, for routing triggers. */
		zendeskConversationTags: string[];
	};
	home: {
		/** Show the recent conversations section on the home screen. */
		recentConversations: boolean;
	};
	contextualCta: {
		/** Render the contextual CTAs served by the support-status endpoint. */
		enabled: boolean;
	};
	moreResources: {
		/** Show the entire More Resources section. */
		visible: boolean;
		/** Show the "Support history" link. */
		supportHistory: boolean;
		/** Show the "Courses" external link. */
		courses: boolean;
		/** Show the "Product updates" external link. */
		productUpdates: boolean;
		/** URL for the "Support guides" external link. Null to hide. */
		supportGuidesUrl: string | null;
	};
	contactForm: {
		/** Which contact form variant to use. */
		variant: 'standard' | 'a4a';
	};
};

/**
 * Product identifier for the help center.
 * Each product gets a preset feature configuration.
 */
export type HelpCenterProduct = 'wpcom' | 'a4a' | 'commerce-garden' | 'woo';
