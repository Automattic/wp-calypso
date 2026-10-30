import type {
	HumanRoutingDecision,
	HumanRoutingFacts,
	HumanRoutingInput,
	HumanRoutingRow,
} from './types';

export function getHumanRoutingFacts( input: HumanRoutingInput ): HumanRoutingFacts {
	const { customer, product } = input;
	const isCore = !! product?.isCore;
	// Zendesk gives target customers Tier 1 too.
	const isTier1 = customer?.supportTier === 'tier_1' || !! customer?.isTargetCustomer;

	return {
		...input,
		// A rev-share product counts as paying.
		isPaying: !! customer?.isPaying || !! product?.isRevShare,
		isTier1,
		// A target customer is Tier 1 even when WooCommerce.com couldn't work out the tier.
		isTierKnown: isTier1 || !! customer?.supportTier,
		isCore,
		isWooProduct: product?.supportType === 'woo' && ! isCore,
	};
}

/**
 * Checks the rows top to bottom; the first row that matches decides the route.
 * Returns null when no row matches, so a table without a catch-all row fails visibly.
 */
export function evaluateHumanRouting(
	rows: readonly HumanRoutingRow[],
	input: HumanRoutingInput
): HumanRoutingDecision | null {
	const facts = getHumanRoutingFacts( input );
	const row = rows.find( ( { when } ) => when( facts ) );

	return row ? { route: row.route, rowId: row.id } : null;
}
