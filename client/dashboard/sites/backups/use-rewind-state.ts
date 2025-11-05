import { siteRewindStateQuery, siteBackupRestoreProgressQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to track rewind state including restore and download progress.
 * Handles polling automatically when operations are active.
 * @param siteId - The site ID to track
 * @returns Object containing detection flags and full restore/download data
 */
export function useRewindState( siteId: number ) {
	// Detection: Check if restore/download exists (fetch once to get restoreId)
	const { data: rewindState } = useQuery( siteRewindStateQuery( siteId ) );

	const restoreId = rewindState?.rewind?.restore_id;

	// Progress: Get detailed data if restore exists and poll while active
	const { data: restoreProgress } = useQuery( {
		...siteBackupRestoreProgressQuery( siteId, restoreId ?? 0 ),
		enabled: !! restoreId,
		refetchInterval: ( query ) => {
			const data = query.state.data;
			// Stop polling when finished or failed
			const isComplete = data?.status === 'finished' || data?.status === 'fail';
			return isComplete ? false : 1500;
		},
	} );

	return {
		// Detection flags
		hasActiveRestore: restoreProgress?.status === 'running' || restoreProgress?.status === 'queued',
		hasFinishedRestore: restoreProgress?.status === 'finished',
		hasFailedRestore: restoreProgress?.status === 'fail',

		// Full data
		rewindState,
		restoreProgress,
		restoreId,
	};
}
