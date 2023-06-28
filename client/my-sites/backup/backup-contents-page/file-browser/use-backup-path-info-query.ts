import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { parseBackupPathInfo } from './util';

export const useBackupPathInfoQuery = (
	siteId: number,
	rewindId: string,
	manifestPath: string,
	extensionType = ''
) => {
	return useQuery( {
		queryKey: [ 'jetpack-backup-path-info', siteId, rewindId, manifestPath, extensionType ],
		queryFn: async () => {
			return wp.req.post(
				{
					path: `/sites/${ siteId }/rewind/backup/path-info`,
					apiNamespace: 'wpcom/v2',
				},
				{
					backup_id: rewindId,
					manifest_path: manifestPath,
					extension_type: extensionType,
				}
			);
		},
		enabled: !! siteId && !! rewindId,
		meta: { persist: false },
		select: parseBackupPathInfo,
		staleTime: Infinity,
	} );
};
