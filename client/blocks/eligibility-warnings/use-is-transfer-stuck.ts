import { siteLatestAtomicTransferQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { parseTransferCreatedAt } from 'calypso/components/transfer-wait/transfer-created-at';
import { isAtomicTransferInProgress } from 'calypso/dashboard/utils/site-atomic-transfers';

const STUCK_AFTER_MS = 5 * 60 * 1000;

export function useIsTransferStuck( siteId?: number | null, enabled = true ): boolean {
	const { data: transfer } = useQuery( {
		...siteLatestAtomicTransferQuery( siteId as number ),
		enabled: !! siteId && enabled,
	} );

	if ( ! enabled || ! transfer || ! isAtomicTransferInProgress( transfer.status ) ) {
		return false;
	}

	if ( transfer.is_stuck ) {
		return true;
	}

	// `created_at` is timezone-naive UTC ('2026-08-12 13:11:10'), which Date.parse reads as local
	// time — shifting a fresh transfer's apparent age by the viewer's UTC offset. The helper
	// appends the missing 'Z'.
	const startedAt = parseTransferCreatedAt( transfer.created_at );
	return Number.isFinite( startedAt ) && Date.now() - startedAt >= STUCK_AFTER_MS;
}
