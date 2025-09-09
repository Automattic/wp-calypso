import { siteBackupContentsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { parseBackupContentsData } from './util';

export const useBackupContentsQuery = (
	siteId: number,
	rewindId: number,
	path: string,
	shouldFetch = true
) => {
	return useQuery( {
		...siteBackupContentsQuery( siteId, rewindId, path ),
		enabled: !! siteId && !! rewindId && !! path && shouldFetch,
		select: parseBackupContentsData,
	} );
};
