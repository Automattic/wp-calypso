/**
 * Where a request for a human goes.
 * - `chat`: a Zendesk messaging conversation.
 * - `ticket`: a Zendesk ticket instead of a chat.
 * - `vendor-ticket`: the request goes to a third-party product's vendor.
 * - `link-out`: the product is supported elsewhere; show its support link.
 * - `email-form`: the email form, which creates a ticket.
 * - `forums`: a message pointing to the forums.
 * - `ai-reply-then-forums`: the bot answers, then points to the forums.
 */
export type HumanSupportRouteType =
	| 'chat'
	| 'ticket'
	| 'vendor-ticket'
	| 'link-out'
	| 'email-form'
	| 'forums'
	| 'ai-reply-then-forums';

/** The type of question the merchant picks at handoff. */
export type HumanSupportQuestionType =
	'technical-support' | 'pre-sales' | 'account' | 'start-scale-store' | 'marketplace-vendor';

export type SupportTier = 'tier_1' | 'tier_2' | 'tier_3';

/** How a product is supported, as `supported_products[].support_type` returns it. */
export type ProductSupportType = 'woo' | 'third_party' | 'external';

export type HumanRoutingProduct = {
	slug: string;
	supportType: ProductSupportType;
	isRevShare: boolean;
	/** WooCommerce Core itself, rather than an extension. */
	isCore: boolean;
};

export type HumanRoutingCustomer = {
	/** Null when WooCommerce.com couldn't work out the tier. */
	supportTier: SupportTier | null;
	isPaying: boolean;
	isTargetCustomer: boolean;
	isWooEnterpriseCustomer: boolean;
};

/** The bot's flags sent with `forward_to_human_support`. */
export type HumanRoutingFlags = {
	isEmergency: boolean;
	emergencyType: string | null;
	routeToEmail: boolean;
};

export type HumanRoutingInput = {
	flags: HumanRoutingFlags;
	/** Null without merchant data; routed like a Tier 2 or 3 merchant who isn't paying. */
	customer: HumanRoutingCustomer | null;
	question: HumanSupportQuestionType;
	/** Null when no product was picked. */
	product: HumanRoutingProduct | null;
};

/** Values derived once from the input, so each row reads as one condition. */
export type HumanRoutingFacts = HumanRoutingInput & {
	isPaying: boolean;
	isTier1: boolean;
	isCore: boolean;
	isWooProduct: boolean;
};

export type HumanRoutingRow = {
	/** The row's number in the decision table, kept stable for tags and tracking. */
	id: number;
	description: string;
	when: ( facts: HumanRoutingFacts ) => boolean;
	route: HumanSupportRouteType;
};

export type HumanRoutingDecision = {
	route: HumanSupportRouteType;
	rowId: number;
};
