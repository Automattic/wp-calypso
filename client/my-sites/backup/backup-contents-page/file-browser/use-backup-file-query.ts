import { fetchBackupFileUrl } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { encodeToBase64 } from './util';

export const useBackupFileQuery = (
	siteId: number,
	rewindId: string | undefined,
	manifestPath: string | undefined,
	shouldFetch = true
) => {
	const encodedManifestPath = encodeToBase64( ( manifestPath as string ) ?? '' );

	return useQuery( {
		queryKey: [ 'jetpack-backup-file-url', siteId, rewindId, encodedManifestPath ],
		queryFn: () => fetchBackupFileUrl( siteId, rewindId!, encodedManifestPath ),
		enabled: !! siteId && !! rewindId && !! manifestPath && shouldFetch,
		meta: { persist: false },
		staleTime: Infinity,
		retry: 2,
	} );
};
