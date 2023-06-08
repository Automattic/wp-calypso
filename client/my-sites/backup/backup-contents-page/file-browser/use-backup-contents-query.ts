import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { parseBackupContentsData } from './util';

export const useBackupContentsQuery = (
	siteId: number,
	rewindId: number,
	path: string,
	shouldFetch = true
) => {
	return useQuery( {
		queryKey: [ 'jetpack-backup-contents-ls', siteId, rewindId, path ],
		queryFn: async () => {
			return wp.req.post(
				{
					path: `/sites/${ siteId }/rewind/backup/ls`,
					apiNamespace: 'wpcom/v2',
				},
				{
					backup_id: rewindId,
					path: path,
				}
			);
		},
		enabled: !! siteId && !! rewindId && !! path && shouldFetch,
		meta: { persist: false },
		select: parseBackupContentsData,
		staleTime: Infinity,
	} );
};
