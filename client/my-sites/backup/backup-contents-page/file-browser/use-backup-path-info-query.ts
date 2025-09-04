import { siteBackupPathInfoQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { parseBackupPathInfo } from './util';

export const useBackupPathInfoQuery = (
	siteId: number,
	rewindId: string,
	manifestPath: string,
	extensionType = ''
) => {
	return useQuery( {
		...siteBackupPathInfoQuery( siteId, rewindId, manifestPath, extensionType ),
		enabled: !! siteId,
		select: parseBackupPathInfo,
	} );
};
