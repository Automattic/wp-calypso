import { siteRewindStateQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

export function useRestoreStatus( siteId: number ) {
	const { data: rewindState } = useQuery( siteRewindStateQuery( siteId ) );

	const restore = rewindState?.rewind;
	const isRestoreInProgress = restore?.status === 'queued' || restore?.status === 'running';

	return {
		restore,
		isRestoreInProgress,
	};
}
