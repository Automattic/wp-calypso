import { evaluateHumanRouting } from './evaluate-human-routing';
import type { HumanRoutingDecision, HumanRoutingInput, HumanRoutingRow } from './types';

/**
 * Who gets a human on WooCommerce.com (WOOPUBR-2400). Rows are checked top to bottom, and the
 * first one that matches decides the route. Asking for a human doesn't override the table.
 *
 * Row ids match the decision table in WOOPUBR-2400; keep them when reordering or editing rows,
 * and give a new row the next unused id.
 */
export const WOO_HUMAN_ROUTING_ROWS: readonly HumanRoutingRow[] = [
	{
		id: 1,
		// Row 2 sends unknown charges to a ticket, but the bot flags them the same way as account
		// recovery, so they land here until it sends them separately.
		description: 'Account recovery or unknown charge',
		when: ( { flags } ) => flags.routeToEmail,
		route: 'email-form',
	},
	{
		id: 3,
		description: 'Emergency, paying',
		when: ( { flags, isPaying } ) => flags.isEmergency && isPaying,
		route: 'chat',
	},
	{
		id: 4,
		description: 'Emergency, not paying',
		when: ( { flags, isPaying } ) => flags.isEmergency && ! isPaying,
		route: 'ticket',
	},
	{
		id: 5,
		description: 'Tier unknown',
		when: ( { isTierKnown } ) => ! isTierKnown,
		route: 'ticket',
	},
	{
		id: 6,
		description: 'Third-party product',
		when: ( { product } ) => product?.supportType === 'third_party',
		route: 'vendor-ticket',
	},
	{
		id: 7,
		description: 'Externally supported product',
		when: ( { product } ) => product?.supportType === 'external',
		route: 'link-out',
	},
	{
		id: 8,
		description: 'Woo Enterprise',
		when: ( { customer } ) => !! customer?.isWooEnterpriseCustomer,
		route: 'ticket',
	},
	{
		id: 9,
		description: 'Tier 1, Core',
		when: ( { isTier1, isCore } ) => isTier1 && isCore,
		route: 'ticket',
	},
	{
		id: 10,
		description: 'Tier 1, anything else',
		when: ( { isTier1 } ) => isTier1,
		route: 'chat',
	},
	{
		id: 11,
		description: 'Tier 2 or 3, Core',
		when: ( { isTier1, isCore } ) => ! isTier1 && isCore,
		route: 'ai-reply-then-forums',
	},
	{
		id: 12,
		description: 'Tier 2 or 3, paying, Woo product or account',
		when: ( { isTier1, isPaying, isWooProduct, question } ) =>
			! isTier1 && isPaying && ( isWooProduct || question === 'account' ),
		route: 'chat',
	},
	{
		id: 13,
		description: 'Paying, anything else',
		when: ( { isPaying } ) => isPaying,
		route: 'ticket',
	},
	{
		id: 14,
		description: 'Not paying, account',
		when: ( { isPaying, question } ) => ! isPaying && question === 'account',
		route: 'chat',
	},
	{
		id: 15,
		// The rules send these to email only without an account, and merchants here are signed in.
		description: 'Not paying, pre-sales, start or scale a store, or Marketplace vendors',
		when: ( { isPaying, question } ) =>
			! isPaying &&
			( question === 'pre-sales' ||
				question === 'start-scale-store' ||
				question === 'marketplace-vendor' ),
		route: 'ticket',
	},
	{
		id: 16,
		// Includes a free Woo product: a rev-share product counts as paying, so it doesn't get here.
		description: 'Not paying, anything else',
		when: () => true,
		route: 'forums',
	},
];

export function getWooHumanSupportRoute( input: HumanRoutingInput ): HumanRoutingDecision {
	// The last row matches everything, so this only falls back if the table loses it.
	return (
		evaluateHumanRouting( WOO_HUMAN_ROUTING_ROWS, input ) ?? {
			route: 'ticket',
			rowId: 0,
		}
	);
}
