import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { parseBackupContentsData, parseBackupPathInfo } from './utils';

export const useBackupContentsQuery = (
	siteId: number,
	rewindId: number,
	path: string,
	shouldFetch = true
) => {
	return useQuery( {
		queryKey: [ 'dashboard-backup-contents-ls', siteId, rewindId, path ],
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

export const useBackupFileQuery = (
	siteId: number,
	rewindId: number,
	path: string,
	shouldFetch = true
) => {
	return useQuery( {
		queryKey: [ 'dashboard-backup-file-info', siteId, rewindId, path ],
		queryFn: async () => {
			return wp.req.post(
				{
					path: `/sites/${ siteId }/rewind/backup/path-info`,
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
		select: parseBackupPathInfo,
		staleTime: Infinity,
	} );
};
