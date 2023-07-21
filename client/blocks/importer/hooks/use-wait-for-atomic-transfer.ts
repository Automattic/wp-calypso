import { useCallback, useState } from 'react';
// import useLatestAtomicTransferQuery from 'calypso/data/hosting/use-latest-atomic-transfer-query';
import wp from 'calypso/lib/wp';

interface LatestAtomicTransfer {
	atomic_transfer_id: number;
	blog_id: number;
	status: string;
	created_at: string;
	is_stuck: boolean;
	is_stuck_reset: boolean;
	in_lossless_revert: boolean;
}

export const transferStates = {
	PENDING: 'pending',
	ACTIVE: 'active',
	PROVISIONED: 'provisioned',
	COMPLETED: 'completed',
	ERROR: 'error',
	REVERTED: 'reverted',
	RELOCATING_REVERT: 'relocating_revert',
	RELOCATING_SWITCHEROO: 'relocating_switcheroo',
	REVERTING: 'reverting',
	RENAMING: 'renaming',
	EXPORTING: 'exporting',
	IMPORTING: 'importing',
	CLEANUP: 'cleanup',
} as const;

export default function useWaitForAtomicTransfer(
	siteId: number | null,
	{ onSuccess }: { onSuccess: () => void }
) {
	const [ isLoading, setIsLoading ] = useState( false );

	const waitForAtomicTransfer = useCallback( async () => {
		if ( ! siteId ) {
			return;
		}

		setIsLoading( true );

		const startTime = new Date().getTime();
		const totalTimeout = 1000 * 300;
		const maxFinishTime = startTime + totalTimeout;

		// Poll for transfer status
		let stopPollingTransfer = false;
		let success = false;

		while ( ! stopPollingTransfer ) {
			await new Promise( ( resolve ) => setTimeout( resolve, 3000 ) );

			try {
				const transfer: LatestAtomicTransfer = await wp.req.get( {
					path: `/sites/${ encodeURIComponent( siteId ) }/atomic/transfers/latest`,
					apiNamespace: 'wpcom/v2',
				} );

				const transferStatus = transfer?.status;

				success = transferStatus === transferStates.COMPLETED;
				stopPollingTransfer = success;
			} catch {}

			if ( maxFinishTime < new Date().getTime() ) {
				stopPollingTransfer = true;
			}
		}

		setIsLoading( false );
		if ( success ) {
			onSuccess();
		}
	}, [ siteId, onSuccess ] );

	return { waitForAtomicTransfer, isLoading };
}
