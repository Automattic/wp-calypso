import { siteRewindStateQuery, siteBackupRestoreProgressQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to track rewind state including restore progress.
 * Handles polling automatically when operations are active.
 * @param siteId - The site ID to track
 * @returns Object containing detection flags and full restore data
 */
export function useRewindState( siteId: number ) {
	// Detection: Check if restore exists and poll when active
	const { data: rewindState } = useQuery( {
		...siteRewindStateQuery( siteId ),
		refetchInterval: ( query ) => {
			const data = query.state.data;
			const hasActiveOperation =
				data?.rewind?.status === 'queued' || data?.rewind?.status === 'running';

			// Poll every 3s if there's an active operation
			return hasActiveOperation ? 3000 : false;
		},
	} );

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
