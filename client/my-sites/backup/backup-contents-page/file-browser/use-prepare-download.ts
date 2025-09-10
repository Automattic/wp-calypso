import {
	siteBackupFilteredDownloadStatusQuery,
	siteBackupFilteredDownloadPrepareMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { PREPARE_DOWNLOAD_STATUS } from './constants';

export const usePrepareDownload = ( siteId: number, onError: () => void ) => {
	const [ status, setStatus ] = useState( PREPARE_DOWNLOAD_STATUS.NOT_STARTED );
	const [ dataType, setDataType ] = useState( 0 );
	const [ buildKey, setBuildKey ] = useState( '' );

	const handleError = useCallback( () => {
		// Reset the status to not started so that the user can try again.
		setStatus( PREPARE_DOWNLOAD_STATUS.NOT_STARTED );

		onError();
	}, [ onError ] );

	const { data, isSuccess, isError } = useQuery( {
		...siteBackupFilteredDownloadStatusQuery( siteId, buildKey, dataType ),
		enabled: !! buildKey && status === PREPARE_DOWNLOAD_STATUS.PREPARING,
		refetchInterval: 5000,
	} );

	useEffect( () => {
		if ( isSuccess && data?.status === 'ready' ) {
			setStatus( PREPARE_DOWNLOAD_STATUS.READY );
		}

		if ( isError ) {
			handleError();
		}
	}, [ isSuccess, isError, handleError, data?.status ] );

	const { mutate } = useMutation( siteBackupFilteredDownloadPrepareMutation() );

	const prepareDownload = useCallback(
		( siteId: number, rewindId: string, manifestFilter: string, dataType: number ) => {
			setStatus( PREPARE_DOWNLOAD_STATUS.PREPARING );
			setDataType( dataType );
			return mutate(
				{ siteId, rewindId, manifestFilter, dataType },
				{
					onSuccess: ( data ) => {
						setBuildKey( data.key );
					},
					onError: handleError,
				}
			);
		},
		[ mutate, handleError ]
	);

	return {
		prepareDownload,
		prepareDownloadStatus: status,
		buildKey,
		downloadUrl: data?.url,
	};
};
