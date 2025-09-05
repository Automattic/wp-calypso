import { prepareBackupDownload, getBackupDownloadStatus } from '@automattic/api-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from '@wordpress/element';
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

export const usePrepareDownload = ( siteId: number, onError: () => void ) => {
	const [ status, setStatus ] = useState( PREPARE_DOWNLOAD_STATUS.NOT_STARTED );
	const [ dataType, setDataType ] = useState( 0 );
	const [ buildKey, setBuildKey ] = useState( '' );

	const handleError = useCallback( () => {
		// Reset the status to not started so that the user can try again.
		setStatus( PREPARE_DOWNLOAD_STATUS.NOT_STARTED );

		onError();
	}, [ onError ] );

	const {
		data,
		isSuccess: isQuerySuccess,
		isError: isQueryError,
	} = useQuery< FilteredStatusResponse >( {
		queryKey: [ 'jetpack-backup-filtered-status', buildKey, siteId, dataType ],
		queryFn: () => getBackupDownloadStatus( siteId, buildKey, dataType ),
		enabled: buildKey !== '' && status === PREPARE_DOWNLOAD_STATUS.PREPARING,
		refetchInterval: 5000, // 5 seconds
		retry: false,
	} );

	useEffect( () => {
		if ( isQuerySuccess && data?.status === 'ready' ) {
			setStatus( PREPARE_DOWNLOAD_STATUS.READY );
		}

		if ( isQueryError ) {
			handleError();
		}
	}, [ isQuerySuccess, isQueryError, handleError, data?.status ] );

	const mutation = useMutation( {
		mutationFn: ( { siteId, rewindId, manifestFilter, dataType }: PrepareDownloadArgs ) =>
			prepareBackupDownload( siteId, rewindId, manifestFilter, dataType ),
		onSuccess: ( data: FilteredPrepareResponse ) => {
			setBuildKey( data.key );
		},
		onError: handleError,
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
	};
};
