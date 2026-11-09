import type {
	HumanRoutingDecision,
	HumanRoutingFacts,
	HumanRoutingInput,
	HumanRoutingRow,
} from './types';

export function getHumanRoutingFacts( input: HumanRoutingInput ): HumanRoutingFacts {
	const { customer, product } = input;
	const isCore = !! product?.isCore;

	return {
		...input,
		// A rev-share product counts as paying.
		isPaying: !! customer?.isPaying || !! product?.isRevShare,
		// Zendesk gives target customers Tier 1 too.
		isTier1: customer?.supportTier === 'tier_1' || !! customer?.isTargetCustomer,
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
