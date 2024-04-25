import { useEffect, useState } from 'react';
import { useSiteTransferMutation } from './mutation';
import { useSiteTransferStatusQuery } from './query';

/**
 * Hook to to initiate a site transfer and monitor its progress
 * @param siteId
 */
export const useSiteMigrationTransfer = ( siteId?: number ) => {
	const [ shouldStartPooling, setShouldStartPooling ] = useState( true );
	const {
		mutate: startTransfer,
		status: startTransferStatus,
		error: startTransferError,
	} = useSiteTransferMutation( siteId );

	const { data, error: statusError } = useSiteTransferStatusQuery( siteId, {
		pooling: shouldStartPooling,
	} );
	const { isStarted, status: transferStatus, isTransferring } = data || {};

	useEffect( () => {
		if ( ! data ) {
			return;
		}

		if ( ! isStarted && startTransferStatus === 'idle' ) {
			setShouldStartPooling( false );
			startTransfer();
		}
	}, [ data, isStarted, startTransfer, startTransferStatus ] );

	useEffect( () => {
		setShouldStartPooling( !! isTransferring );
	}, [ isTransferring ] );

	return {
		status: transferStatus,
		error: statusError || startTransferError || null,
	};
};
