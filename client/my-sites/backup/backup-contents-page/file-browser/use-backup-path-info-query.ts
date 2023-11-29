import { useQuery } from '@tanstack/react-query';
import { useEffect } from '@wordpress/element';
import wp from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { onRetrievingFileInfoError } from './notices';
import { parseBackupPathInfo } from './util';

export const useBackupPathInfoQuery = (
	siteId: number,
	rewindId: string,
	manifestPath: string,
	extensionType = ''
) => {
	const dispatch = useDispatch();

	const query = useQuery( {
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
		enabled: !! siteId,
		meta: { persist: false },
		select: parseBackupPathInfo,
		staleTime: Infinity,
		retry: 2,
	} );

	useEffect( () => {
		if ( query.isError ) {
			dispatch( onRetrievingFileInfoError() );
		}
	}, [ dispatch, query.isError ] );

	return query;
};
