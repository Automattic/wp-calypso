import { evaluateHumanRouting } from './evaluate-human-routing';
import type { HumanRoutingDecision, HumanRoutingInput, HumanRoutingRow } from './types';

/**
 * Who gets a human on WooCommerce.com (WOOPUBR-2400). Rows are checked top to bottom, and the
 * first one that matches decides the route. Asking for a human doesn't override the table.
 *
 * Row ids match the decision table in WOOPUBR-2400; keep them when reordering or editing rows.
 */
export const WOO_HUMAN_ROUTING_ROWS: readonly HumanRoutingRow[] = [
	{
		id: 1,
		description: 'Account recovery or unknown charge',
		when: ( { flags } ) => flags.routeToEmail,
		route: 'email-form',
	},
	{
		id: 2,
		description: 'Emergency, paying',
		when: ( { flags, isPaying } ) => flags.isEmergency && isPaying,
		route: 'chat',
	},
	{
		id: 3,
		description: 'Emergency, not paying',
		when: ( { flags, isPaying } ) => flags.isEmergency && ! isPaying,
		route: 'ticket',
	},
	{
		id: 4,
		description: 'Tier unknown (lookup failed)',
		when: ( { isTierKnown } ) => ! isTierKnown,
		route: 'ticket',
	},
	{
		id: 5,
		description: 'Third-party product',
		when: ( { product } ) => product?.supportType === 'third_party',
		route: 'vendor-ticket',
	},
	{
		id: 6,
		description: 'Externally supported product',
		when: ( { product } ) => product?.supportType === 'external',
		route: 'link-out',
	},
	{
		id: 7,
		description: 'Woo Enterprise',
		when: ( { customer } ) => !! customer?.isWooEnterpriseCustomer,
		route: 'ticket',
	},
	{
		id: 8,
		description: 'Tier 1, Core',
		when: ( { isTier1, isCore } ) => isTier1 && isCore,
		route: 'ticket',
	},
	{
		id: 9,
		description: 'Tier 1, anything else',
		when: ( { isTier1 } ) => isTier1,
		route: 'chat',
	},
	{
		id: 10,
		description: 'Tier 2 or 3, Woo product or account',
		when: ( { isTier1, isWooProduct, question } ) =>
			! isTier1 && ( isWooProduct || question === 'account' ),
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
		description: 'Paying, anything else',
		when: ( { isPaying } ) => isPaying,
		route: 'ticket',
	},
	{
		id: 13,
		description: 'Not paying, pre-sales or payment extension',
		when: ( { isPaying, question, product } ) =>
			! isPaying && ( question === 'pre-sales' || !! product?.isPaymentExtension ),
		route: 'email-form',
	},
	{
		id: 14,
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
