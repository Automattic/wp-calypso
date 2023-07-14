import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const useBackupFileQuery = (
	siteId: number,
	rewindId: string | undefined,
	manifestPath: string | undefined,
	shouldFetch = true
) => {
	const encodedManifestPath = window.btoa( manifestPath ?? '' );

	return useQuery( {
		queryKey: [ 'jetpack-backup-file-url', siteId, rewindId, encodedManifestPath ],
		queryFn: async () => {
			return wp.req.get( {
				path: `/sites/${ siteId }/rewind/backup/${ rewindId }/file/${ encodedManifestPath }/url`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: !! siteId && !! rewindId && !! manifestPath && shouldFetch,
		meta: { persist: false },
		staleTime: Infinity,
		retry: 2,
	} );
};
