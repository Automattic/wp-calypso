import { fetchBackupPathInfo } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { parseBackupPathInfo } from './util';

export const useBackupPathInfoQuery = (
	siteId: number,
	rewindId: string,
	manifestPath: string,
	extensionType = ''
) => {
	return useQuery( {
		queryKey: [ 'jetpack-backup-path-info', siteId, rewindId, manifestPath, extensionType ],
		queryFn: () => fetchBackupPathInfo( siteId, rewindId, manifestPath, extensionType ),
		enabled: !! siteId,
		meta: { persist: false },
		select: parseBackupPathInfo,
		staleTime: Infinity,
		retry: 2,
	} );
};
