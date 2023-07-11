import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from '@wordpress/element';
import wp from 'calypso/lib/wp';
import { PREPARE_DOWNLOAD_STATUS } from './constants';

interface PrepareDownloadArgs {
	siteId: number;
	rewindId: string;
	manifestFilter: string;
	dataType: number;
}

interface FilteredPrepareResponse {
	ok: boolean;
	key: string;
}

export const usePrepareDownload = () => {
	const [ status, setStatus ] = useState( PREPARE_DOWNLOAD_STATUS.DEFAULT );
	const [ buildKey, setBuildKey ] = useState( '' );

	const mutation = useMutation( {
		mutationFn: ( { siteId, rewindId, manifestFilter, dataType }: PrepareDownloadArgs ) =>
			wp.req.post(
				{
					path: `/sites/${ siteId }/rewind/backup/filtered/prepare`,
					apiNamespace: 'wpcom/v2',
				},
				{
					backup_id: rewindId,
					manifest_filter: manifestFilter,
					data_type: dataType,
				}
			),
		onSuccess: ( data: FilteredPrepareResponse ) => {
			// @TODO: query filtered/status to get the status and/or the URL
			setBuildKey( data.key );
		},
	} );

	const { mutate } = mutation;

	const prepareDownload = useCallback(
		( siteId: number, rewindId: string, manifestFilter: string, dataType: number ) => {
			setStatus( PREPARE_DOWNLOAD_STATUS.PREPARING );
			return mutate( { siteId, rewindId, manifestFilter, dataType } );
		},
		[ mutate ]
	);

	return { prepareDownload, prepareDownloadStatus: status, buildKey, ...mutation };
};
