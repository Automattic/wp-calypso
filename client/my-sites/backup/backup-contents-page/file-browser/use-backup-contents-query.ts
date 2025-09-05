import { fetchBackupContents } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { parseBackupContentsData } from './util';

export const useBackupContentsQuery = (
	siteId: number,
	rewindId: number,
	path: string,
	shouldFetch = true
) => {
	return useQuery( {
		queryKey: [ 'jetpack-backup-contents-ls', siteId, rewindId, path ],
		queryFn: () => fetchBackupContents( siteId, rewindId, path ),
		enabled: !! siteId && !! rewindId && !! path && shouldFetch,
		meta: { persist: false },
		select: parseBackupContentsData,
		staleTime: Infinity,
	} );
};
