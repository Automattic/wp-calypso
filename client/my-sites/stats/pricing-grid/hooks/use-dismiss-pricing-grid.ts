import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import type { Notices } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';

/** The `from` value the pricing grid's paid CTA sends to the purchase page. */
export const PRICING_GRID_REFERRER = 'jetpack-stats-pricing-grid';

/**
 * Returns a function that records the pricing grid dismissal server-side and
 * patches the cached notices in place, so the gate sees the choice on SPA route
 * changes without waiting for a refetch. The patch can't cover every path — the
 * raw notices entry may be absent when the purchase page was reached directly —
 * but the round-trip needn't be awaited: the mutation invalidates the notices
 * query on success, so a gate that fetched pre-dismissal state self-corrects
 * once the POST lands. A rejection (after the mutation's own retry) is
 * swallowed here — a dismissal that ultimately fails just re-shows the grid.
 *
 * Only a plan decision dismisses: "Start for free" on the grid, or "I will do
 * it later" on the purchase page. Merely reaching the purchase page does not —
 * an abandoned checkout brings the visitor back to the grid.
 */
export default function useDismissPricingGrid( siteId: number | null ) {
	const queryClient = useQueryClient();
	const { mutateAsync: recordDismissal } = useNoticeVisibilityMutation(
		siteId,
		'pricing_grid',
		'dismissed'
	);

	return useCallback( () => {
		recordDismissal().catch( () => null );
		queryClient.setQueryData(
			[ 'stats', 'notices-visibility', 'raw', siteId ],
			( notices: Notices | undefined ) => notices && { ...notices, pricing_grid: false }
		);
	}, [ recordDismissal, queryClient, siteId ] );
}
