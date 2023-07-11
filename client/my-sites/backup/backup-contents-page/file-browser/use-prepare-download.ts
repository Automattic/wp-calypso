import { useMutation, useQuery } from '@tanstack/react-query';
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

interface FilteredStatusResponse {
	ok: boolean;
	status: string;
	download_id: string;
	token: string;
	url: string;
}

export const usePrepareDownload = ( siteId: number ) => {
	const [ status, setStatus ] = useState( PREPARE_DOWNLOAD_STATUS.NOT_STARTED );
	const [ dataType, setDataType ] = useState( 0 );
	const [ buildKey, setBuildKey ] = useState( '' );

	const { data } = useQuery( {
		queryKey: [ 'jetpack-backup-filtered-status', buildKey, siteId, dataType ],
		queryFn: () =>
			wp.req.post(
				{
					path: `/sites/${ siteId }/rewind/backup/filtered/status`,
					apiNamespace: 'wpcom/v2',
				},
				{
					data_type: dataType,
					key: buildKey,
				}
			),
		enabled: buildKey !== '' && status !== PREPARE_DOWNLOAD_STATUS.READY,
		refetchInterval: 5000, // 5 seconds
		retry: false,
		onSuccess: ( data: FilteredStatusResponse ) => {
			if ( data.status === 'ready' ) {
				setStatus( PREPARE_DOWNLOAD_STATUS.READY );
			}
		},
	} );

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
			setBuildKey( data.key );
		},
	} );

	const { mutate } = mutation;

	const prepareDownload = useCallback(
		( siteId: number, rewindId: string, manifestFilter: string, dataType: number ) => {
			setStatus( PREPARE_DOWNLOAD_STATUS.PREPARING );
			setDataType( dataType );
			return mutate( { siteId, rewindId, manifestFilter, dataType } );
		},
		[ mutate ]
	);

	return {
		prepareDownload,
		prepareDownloadStatus: status,
		buildKey,
		downloadUrl: data?.url,
		...mutation,
	};
};
