import { siteBackupFileQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { encodeToBase64 } from './util';

export const useBackupFileQuery = (
	siteId: number,
	rewindId: string | undefined,
	manifestPath: string | undefined,
	shouldFetch = true
) => {
	const encodedManifestPath = encodeToBase64( ( manifestPath as string ) ?? '' );

	return useQuery(
		siteBackupFileQuery(
			siteId,
			rewindId!,
			encodedManifestPath,
			!! siteId && !! rewindId && !! manifestPath && shouldFetch
		)
	);
};
